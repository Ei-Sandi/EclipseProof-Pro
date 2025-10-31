import express, { Router, Request, Response } from 'express';
import fs from 'fs';
import { extractPayslipData } from '../services/GeminiService.js';
export default (upload: any) => {
  const router: Router = express.Router();

  // 8. API Route: Upload and extract
  router.post('/generate', upload.single('payslip'), async (req: Request, res: Response) => {
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
        (currentDate.getTime() - payslipDate.getTime()) / (1000 * 60 * 60 * 24)
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
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Error:', errMsg);
      
      // Delete file if error occurred
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: errMsg
      });
    }
  });

  return router;
};
