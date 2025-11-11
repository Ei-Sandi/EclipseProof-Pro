import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { PayslipJSON, ExtractionResult } from '../types/payslip.types';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!;
const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

export class VertexPayslipExtractor {
  private vertexAI: VertexAI;
  private model: any;

  constructor() {
    this.vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });

    this.model = this.vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            grossPay: { type: SchemaType.NUMBER, nullable: true },
            netPay: { type: SchemaType.NUMBER, nullable: true },
            paymentDate: { type: SchemaType.STRING, nullable: true },
            employeeName: { type: SchemaType.STRING, nullable: true },
            employerId: { type: SchemaType.STRING, nullable: true },
            taxAmount: { type: SchemaType.NUMBER, nullable: true },
            niAmount: { type: SchemaType.NUMBER, nullable: true },
          },
          required: ['grossPay', 'paymentDate'],
        },
      },
    });

    console.log(`✅ Vertex AI initialized: ${PROJECT_ID} (${LOCATION})`);
  }

  async extractFromPDF(pdfBuffer: Buffer): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      console.log(`📄 Processing PDF (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

      const base64PDF = pdfBuffer.toString('base64');
      const prompt = this.createExtractionPrompt();

      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64PDF,
                },
              },
            ],
          },
        ],
      });

      const responseText = result.response.candidates[0].content.parts[0].text;
      const extractedData: PayslipJSON = JSON.parse(responseText);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Extraction complete in ${processingTime}ms`);

      return {
        success: true,
        data: extractedData,
        processingTime,
      };
    } catch (error) {
      console.error('❌ Extraction failed:', error);

      return {
        success: false,
        data: null,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create the prompt for Gemini model
   */
  private createExtractionPrompt(): string {
    return `You are a UK payslip data extraction specialist.

Extract the following information from this payslip PDF:

Required Fields:
- employeeName
- netPay
- paymentDate: Payment date in YYYY-MM-DD format

Rules:
1. If a value is missing, return null.
2. Return only valid JSON.
3. Dates like DD/MM/YYYY should be converted to YYYY-MM-DD.
4. Remove currency symbols like £.

Return only the JSON object.`;
  }
}

export const vertexExtractor = new VertexPayslipExtractor();
