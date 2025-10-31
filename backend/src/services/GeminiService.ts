import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function fileToGenerativePart(path: string, mimeType: string): { inlineData: { data: string; mimeType: string } } {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType: mimeType
    }
  };
}

export async function extractPayslipData(filePath: string): Promise<any> {
  try {
    console.log('📄 Reading file:', filePath);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp" 
    });
    
    const pdfPart = fileToGenerativePart(filePath, 'application/pdf');
    
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
    
    const result = await model.generateContent([prompt, pdfPart]);
    const response = await result.response;
    let text = response.text().trim();
    
    console.log('📥 Raw response:', text);
    
    text = text.replace(/``````/g, '').trim();
    
    console.log('🧹 Cleaned response:', text);
    
    const extractedData = JSON.parse(text);
    
    console.log('✅ Parsed data:', extractedData);
    
    return extractedData;
    
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Extraction error:', errMsg);
    throw error;
  }
}
