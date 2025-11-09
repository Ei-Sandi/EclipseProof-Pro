// src/types/payslip.types.ts

export interface PayslipJSON {
  grossPay: number | null;
  netPay?: number | null;
  paymentDate: string | null;
  employeeName?: string | null;
  employerId?: string | null;
  taxAmount?: number | null;
  niAmount?: number | null;
}

export interface ExtractionResult {
  success: boolean;
  data: PayslipJSON | null;
  processingTime: number; // in milliseconds
  error?: string;
}
