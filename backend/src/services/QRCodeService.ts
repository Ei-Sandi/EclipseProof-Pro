import QRCode from 'qrcode';

export interface QRCodeData {
    employeeName: string;
    netPay: number;
    proveAmount: number;
    proofGeneratedDate: string;
    randomness: string;
    verificationHash: string;
}

export class QRCodeService {
    /**
     * Generate a QR code containing proof verification data
     * @param data - The proof data to encode in the QR code
     * @returns Base64 encoded QR code image
     */
    static async generateProofQRCode(data: QRCodeData): Promise<string> {
        try {
            // Create a JSON string with the proof data
            const qrData = JSON.stringify({
                name: data.employeeName,
                netPay: data.netPay,
                proveAmount: data.proveAmount,
                date: data.proofGeneratedDate,
                randomness: data.randomness,
                hash: data.verificationHash
            });

            // Generate QR code as a base64 data URL
            const qrCodeDataURL = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2
            });

            return qrCodeDataURL;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.error('❌ QR Code generation error:', errMsg);
            throw new Error(`Failed to generate QR code: ${errMsg}`);
        }
    }
}
