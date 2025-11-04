import express, { Router, Request, Response } from 'express';
import fs from 'fs';

import { extractPayslipData } from '../services/PayslipParser.js';
import { verifyIdDocument } from '../services/VerificationService.js';
import { uploadIdDocument, uploadPayslip } from '../config/multerConfig.js';

export const proofRouter: Router = express.Router();

proofRouter.post('/verify', uploadIdDocument.single('idDocument'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No ID document uploaded'
      });
    }

    console.log('\n🆔 New ID verification:', req.file.originalname);

    const verificationResult = await verifyIdDocument(req.file.path);

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      ...verificationResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ ID verification error:', errMsg);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: errMsg
    });
  }
});

proofRouter.post('/generate', uploadPayslip.single('payslip'), async (req: Request, res: Response) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('\n🆕 New upload:', req.file.originalname);

    const amountToProve = parseFloat(req.body.amountToProve);

    const extractedData = await extractPayslipData(req.file.path);

    const payslipDate = new Date(extractedData.payslipDate);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate.getTime() - payslipDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const meetsIncomeRequirement = extractedData.grossPay >= amountToProve;
    const meets30DayRequirement = daysDifference >= 30;
    const verified = meetsIncomeRequirement && meets30DayRequirement;

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

    fs.unlinkSync(req.file.path);

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error:', errMsg);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: errMsg
    });
  }
});
