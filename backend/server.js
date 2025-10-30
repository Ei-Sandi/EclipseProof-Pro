
// 1. Load environment variables from .env file
require('dotenv').config();

// 2. Import required libraries
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 3. Create Express app
const app = express();
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON in requests

// 4. Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 5. Configure file upload (Multer)
const storage = multer.diskStorage({
  destination: './uploads', // Save files here
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter: (req, file, cb) => {
    // Only accept PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  }
});

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// 6. Helper function: Convert PDF to base64
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType: mimeType
    }
  };
}

// 7. Main extraction function
async function extractPayslipData(filePath) {
  try {
    console.log('📄 Reading file:', filePath);
    
    // Choose the Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp" 
    });
    
    // Convert PDF to base64
    const pdfPart = fileToGenerativePart(filePath, 'application/pdf');
    
    // Create the prompt
    const prompt = `
Analyze this payslip document and extract the following information.
Return ONLY a valid JSON object with this exact structure, no other text:

{
  "grossPay": <number without currency symbols>,
  "netPay": <number without currency symbols or null>,
  "payslipDate": "<date in YYYY-MM-DD format>",
  "employeeName": "<full name or null>",
  "employerId": "<company name or null>"
}

Rules:
- Extract only numbers for grossPay and netPay (remove £, $, commas)
- Convert any date format to YYYY-MM-DD
- Use null if field cannot be found
- Return valid JSON only
`;
    
    console.log('🤖 Sending to Gemini API...');
    
    // Send to Gemini
    const result = await model.generateContent([prompt, pdfPart]);
    const response = await result.response;
    let text = response.text().trim();
    
    console.log('📥 Raw response:', text);
    
    
    // Clean markdown formatting like ```json ... ```
    text = text.replace(/```json|```/g, '').trim();

    
    console.log('🧹 Cleaned response:', text);
    
    // Parse JSON
    const extractedData = JSON.parse(text);
    
    console.log('✅ Parsed data:', extractedData);
    
    return extractedData;
    
  } catch (error) {
    console.error('Extraction error:', error.message);
    throw error;
  }
}

// 8. API Route: Upload and extract
app.post('/api/proof/generate', upload.single('payslip'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    console.log('\n🆕 New upload:', req.file.originalname);
    
    const amountToProve = parseFloat(req.body.amountToProve);
    console.log('💰 Amount to prove: £' + amountToProve);
    
    // Extract data using Gemini
    const extractedData = await extractPayslipData(req.file.path);
    
    // Calculate days since payslip
    const payslipDate = new Date(extractedData.payslipDate);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate - payslipDate) / (1000 * 60 * 60 * 24)
    );
    
    console.log('📅 Days since payslip:', daysDifference);
    
    // Validate requirements
    const meetsIncomeRequirement = extractedData.grossPay >= amountToProve;
    const meets30DayRequirement = daysDifference >= 30;
    const verified = meetsIncomeRequirement && meets30DayRequirement;
    
    console.log('✓ Income check:', meetsIncomeRequirement);
    console.log('✓ 30-day check:', meets30DayRequirement);
    console.log('🎯 Verified:', verified);
    
    // Send response
    res.json({
      success: true,
      verified: verified,
      extracted: extractedData,
      validation: {
        grossPay: extractedData.grossPay,
        requiredAmount: amountToProve,
        meetsIncomeRequirement: meetsIncomeRequirement,
        daysSincePayslip: daysDifference,
        meets30DayRequirement: meets30DayRequirement,
        reason: !meets30DayRequirement 
          ? `Payslip is only ${daysDifference} days old (need 30+)`
          : !meetsIncomeRequirement 
          ? `Gross pay £${extractedData.grossPay} is below £${amountToProve}`
          : "✅ All requirements met"
      },
      timestamp: new Date().toISOString()
    });
    
    // Delete the uploaded file (cleanup)
    fs.unlinkSync(req.file.path);
    console.log('🗑️  File deleted\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Delete file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 9. Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// 10. Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log('📡 Ready to process payslips!\n');
});
