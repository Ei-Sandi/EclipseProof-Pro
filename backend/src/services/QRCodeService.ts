import QRCode from 'qrcode';

export class QRCodeService {
    static async generateVerificationQR(
        baseUrl: string,
        requestId: string,
        salt: string
    ): Promise<string> {
        const params = new URLSearchParams({
            requestId: requestId,
            salt: salt
        });

        const fullUrl = `${baseUrl}?${params.toString()}`;

        try {
            const qrImage = await QRCode.toDataURL(fullUrl, {
                errorCorrectionLevel: 'H',
                margin: 2,
                scale: 10,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            return qrImage;

        } catch (err) {
            console.error("Error generating QR code:", err);
            throw new Error("Failed to generate QR Code");
        }
    }
}