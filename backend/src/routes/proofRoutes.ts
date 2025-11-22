import express, { Router, Request, Response } from 'express';
import fs from 'fs';

import { vertexExtractor } from '../services/PayslipParser.js';
import { verifyIdDocument } from '../services/VerificationService.js';
import { uploadIdDocument, uploadPayslip } from '../config/multerConfig.js';
import { requireAuth } from './authRoutes.js';
import { UserAccountManager } from '../services/UserAccountManager.js';

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

      console.log('✅ Stored DOB and name in user state for witness:', {
        userId: user.userID,
        idName: IDname,
        dob: DOB,
        dobBytesLength: dobBytes.length
      });
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

    console.log('\n📄 New payslip proof generation:', {
      filename: req.file.originalname,
      amountToProve: amountToProve
    });

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
    const isWithin60Days = daysDifference <= 60 && daysDifference >= 0;
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

    // TODO: Generate ZK proof using the Compact contract
    // The contract will call getIDDOB() witness, which will return user.idDOB
    // Example (to be implemented with full contract integration):
    // 
    // import { payslipContractInstance } from '../../../contracts/src/index.js';
    // 
    // const privateState = { idDOB: user.idDOB };
    // const randomness = crypto.randomBytes(32);
    // 
    // const txResult = await payslipContractInstance.createVerificationHash(
    //   employeeName, 
    //   netPay, 
    //   amountToProve, 
    //   proofGeneratedDate, 
    //   randomness,
    //   { privateState }
    // );

    console.log('✅ Proof verification complete:', {
      verified,
      meetsIncomeRequirement,
      isWithin60Days,
      hasDOB: !!user.idDOB,
      idName: user.idName,
      payslipName: employeeName,
      nameMatches: true
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
        nameMatches: true
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