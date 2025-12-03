import QRCode from 'qrcode';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';

export interface QRCodeData {
    requestId: string;
    salt: string;
}

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

    static async decodeVerificationQR(imagePath: string): Promise<QRCodeData> {
        try {
            const image = await Jimp.read(imagePath);
            const imageData = {
                data: new Uint8ClampedArray(image.bitmap.data),
                width: image.bitmap.width,
                height: image.bitmap.height
            };

            const decoded = jsQR(imageData.data, imageData.width, imageData.height);

            if (!decoded) {
                throw new Error('Failed to decode QR code');
            }

            // Parse URL from QR code
            const qrUrl = decoded.data;
            const url = new URL(qrUrl);
            const requestId = url.searchParams.get('requestId');
            const salt = url.searchParams.get('salt');

            if (!requestId || !salt) {
                throw new Error('Invalid QR code: missing requestId or salt');
            }

            return { requestId, salt };

        } catch (err) {
            console.error("Error decoding QR code:", err);
            throw new Error(err instanceof Error ? err.message : "Failed to decode QR Code");
        }
    }
}