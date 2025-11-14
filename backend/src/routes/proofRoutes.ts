import express, { Router, Request, Response } from 'express';
import fs from 'fs';

import { vertexExtractor } from '../services/PayslipParser.js';
import { verifyIdDocument } from '../services/VerificationService.js';
import { uploadIdDocument, uploadPayslip } from '../config/multerConfig.js';
import { requireAuth } from './authRoutes.js';

export const proofRouter: Router = express.Router();

proofRouter.post('/verify', requireAuth, uploadIdDocument.single('idDocument'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No ID document uploaded'
      });
    }

    const documentType = req.body.documentType;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    console.log('\n🆔 New ID verification:', {
      filename: req.file.originalname,
      documentType: documentType
    });

    const verificationResult = await verifyIdDocument(req.file.path, documentType);

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      ...verificationResult,
      documentType: documentType,
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

proofRouter.post('/generate', requireAuth, uploadPayslip.single('payslip'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No payslip file uploaded'
      });
    }

    const amountToProve = parseFloat(req.body.amountToProve);

    if (!amountToProve || isNaN(amountToProve) || amountToProve <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount to prove is required'
      });
    }

    console.log('\n📄 New payslip proof generation:', {
      filename: req.file.originalname,
      amountToProve: amountToProve
    });

    // ✅ Read file as Buffer (Vertex AI needs buffer, not file path)
    const pdfBuffer = fs.readFileSync(req.file.path);

    // ✅ Use Vertex AI instead of old extractPayslipData()
    const extractionResult = await vertexExtractor.extractFromPDF(pdfBuffer);

    // ✅ Delete file after reading
    fs.unlinkSync(req.file.path);

    // ✅ If extraction failed
    if (!extractionResult.success || !extractionResult.data) {
      return res.status(422).json({
        success: false,
        message: 'Failed to extract data from payslip',
        error: extractionResult.error || 'Extraction returned no data',
        processingTime: extractionResult.processingTime
      });
    }

    const extractedData = extractionResult.data;

    // ✅ Same logic as before (no change here)
    // Safely parse paymentDate (handle string | null)
    const rawDate = extractedData.paymentDate;
    if (rawDate == null) {
      return res.status(422).json({
        success: false,
        message: 'Payslip paymentDate is missing',
        extracted: extractedData
      });
    }
    const payslipDate = new Date(rawDate);
    if (Number.isNaN(payslipDate.getTime())) {
      return res.status(422).json({
        success: false,
        message: 'Invalid payslip paymentDate',
        extracted: extractedData
      });
    }
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate.getTime() - payslipDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Validate grossPay presence and numeric value
    const rawGrossPay = extractedData.grossPay;
    const grossPay = typeof rawGrossPay === 'number' ? rawGrossPay : parseFloat(String(rawGrossPay));
    if (rawGrossPay == null || Number.isNaN(grossPay)) {
      return res.status(422).json({
        success: false,
        message: 'Payslip grossPay is missing or invalid',
        extracted: extractedData
      });
    }

    const meetsIncomeRequirement = grossPay >= amountToProve;
    const isWithin60Days = daysDifference <= 60 && daysDifference >= 0;
    const verified = meetsIncomeRequirement && isWithin60Days;

    res.json({
      success: true,
      verified: verified,
      extracted: extractedData,
      validation: {
        grossPay: grossPay,
        requiredAmount: amountToProve,
        meetsIncomeRequirement: meetsIncomeRequirement,
        daysSincePayslip: daysDifference,
        isWithin60Days: isWithin60Days,
        reason: !isWithin60Days
          ? daysDifference < 0
            ? `Payslip date is in the future`
            : `Payslip is ${daysDifference} days old (must be within last 60 days)`
          : !meetsIncomeRequirement
            ? `Gross pay £${grossPay} is below £${amountToProve}`
            : "✅ All requirements met"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Payslip proof generation error:', errMsg);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: errMsg
    });
  }
});

// New endpoint: Verify a proof by ID (for verifier scanning QR code)
proofRouter.get('/verify/:proofId', async (req: Request, res: Response) => {
  try {
    const { proofId } = req.params;

    if (!proofId) {
      return res.status(400).json({
        success: false,
        message: 'Proof ID is required'
      });
    }

    console.log(`\n🔍 Verifying proof: ${proofId}`);

    // TODO: In production, fetch from database and verify against on-chain hash
    // For now, we'll simulate a proof verification response
    
    // The proof contains these circuit attributes:
    // - verificationHash: on-chain commitment (public)
    // - proveAmount: threshold amount to prove (public to verifier)
    // - proofGeneratedDate: when proof was created (public)
    // - Private data (name, DOB, actual netPay) remains hidden
    
    const mockProof = {
      valid: true,
      threshold: 25000, // This is the proveAmount from circuit
      proofId: proofId,
      verificationHash: '0x' + Buffer.from(proofId).toString('hex').padStart(64, '0').slice(0, 64),
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      verified: true,
      circuitVerified: true // Indicates the circuit proof was validated
    };

    res.json(mockProof);

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Proof verification error:', errMsg);

    res.status(500).json({
      success: false,
      message: errMsg
    });
  }
});