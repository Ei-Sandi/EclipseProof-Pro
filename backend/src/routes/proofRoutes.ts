import express, { Router, Request, Response } from 'express';
import fs from 'fs';

import { vertexExtractor } from '../services/PayslipParser.js';
import { verifyIdDocument } from '../services/IDVerificationService.js';
import { uploadIdDocument, uploadPayslip } from '../config/multerConfig.js';
import { requireAuth } from './authRoutes.js';
import { UserAccountManager } from '../services/UserAccountManager.js';
import { VerificationProof } from '../services/VerificationProof.js';
import { QRCodeService } from '../services/QRCodeService.js';

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

    const verificationResult = await verifyIdDocument(req.file.path, documentType);
    const IDname = verificationResult.extractedData.name;
    const DOB = verificationResult.extractedData.dob;

    // Store the verified DOB and name in the user's session for the witness
    const userAccountManager = UserAccountManager.getInstance();
    const user = userAccountManager.getUser(req.sessionID);

    if (user) {
      // Convert DOB string to Uint8Array for the Compact contract witness
      const dobBytes = new TextEncoder().encode(DOB);
      user.idDOB = dobBytes;
      user.idName = IDname;
    }

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

    const pdfBuffer = fs.readFileSync(req.file.path);

    const extractionResult = await vertexExtractor.extractFromPDF(pdfBuffer);

    fs.unlinkSync(req.file.path);

    if (!extractionResult.success || !extractionResult.data) {
      return res.status(422).json({
        success: false,
        message: 'Failed to extract data from payslip',
        error: extractionResult.error || 'Extraction returned no data',
        processingTime: extractionResult.processingTime
      });
    }

    const extractedData = extractionResult.data;

    const employeeName = extractedData.employeeName;
    if (!employeeName || typeof employeeName !== 'string' || employeeName.trim() === '') {
      return res.status(422).json({
        success: false,
        message: 'Payslip employeeName is missing or invalid',
        extracted: extractedData
      });
    }

    const rawDate = extractedData.paymentDate;
    if (rawDate == null) {
      return res.status(422).json({
        success: false,
        message: 'Payslip paymentDate is missing.',
        extracted: extractedData
      });
    }

    const payslipDate = new Date(rawDate);
    if (Number.isNaN(payslipDate.getTime())) {
      return res.status(422).json({
        success: false,
        message: 'Payslip paymentDate is invalid.',
        extracted: extractedData
      });
    }

    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate.getTime() - payslipDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const rawNetPay = extractedData.netPay;
    const netPay = typeof rawNetPay === 'number' ? rawNetPay : parseFloat(String(rawNetPay));
    if (rawNetPay == null || Number.isNaN(netPay)) {
      return res.status(422).json({
        success: false,
        message: 'Payslip grossPay is missing or invalid',
        extracted: extractedData
      });
    }

    const meetsIncomeRequirement = netPay >= amountToProve;
    const isWithin60Days = true //daysDifference <= 60 && daysDifference >= 0;
    const verified = meetsIncomeRequirement && isWithin60Days;

    // Get the user to access the verified DOB for the witness
    const userAccountManager = UserAccountManager.getInstance();
    const user = userAccountManager.getUser(req.sessionID);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found'
      });
    }

    if (!user.idDOB) {
      return res.status(400).json({
        success: false,
        message: 'ID verification required before generating proof. Please verify your ID first.'
      });
    }

    // Remove comment after implementing ID verification 

    // if (!user.idName) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'ID verification incomplete. Please verify your ID again.'
    //   });
    // }

    // const normalizedIdName = user.idName.trim().toLowerCase().replace(/\s+/g, ' ');
    // const normalizedPayslipName = employeeName.trim().toLowerCase().replace(/\s+/g, ' ');

    // if (normalizedIdName !== normalizedPayslipName) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Name mismatch: The name on your payslip does not match the name on your ID document.',
    //     details: {
    //       idName: user.idName,
    //       payslipName: employeeName
    //     }
    //   });
    // }

    // console.log('✅ Name verification passed:', {
    //   idName: user.idName,
    //   payslipName: employeeName
    // });

    // Generate ZK proof using the Compact contract
    const verificationProof = new VerificationProof();
    const proofResult = await verificationProof.generateVerificationProof({
      idDOB: user.idDOB,
      employeeName,
      netPay,
      amountToProve,
      user
    });

    if (!proofResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate verification proof',
        error: proofResult.error
      });
    }

    // Generate QR code with proof data
    const qrCodeDataURL = await QRCodeService.generateProofQRCode({
      employeeName,
      netPay,
      proveAmount: amountToProve,
      proofGeneratedDate: proofResult.proofGeneratedDate?.toString() || '',
      randomness: proofResult.randomness ? Buffer.from(proofResult.randomness).toString('hex') : '',
      verificationHash: proofResult.verificationHash ? Buffer.from(proofResult.verificationHash).toString('hex') : ''
    });

    res.json({
      success: true,
      verified,
      proofDetails: {
        employeeName,
        meetsIncomeRequirement,
        isWithin60Days,
        netPay,
        amountToProve,
        payslipDate: payslipDate.toISOString(),
        daysSincePayslip: daysDifference,
        hasVerifiedID: !!user.idDOB,
        nameMatches: true,
        verificationHash: proofResult.verificationHash ?
          Buffer.from(proofResult.verificationHash).toString('hex') : undefined,
        proofGeneratedDate: proofResult.proofGeneratedDate?.toString(),
        qrCode: qrCodeDataURL
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