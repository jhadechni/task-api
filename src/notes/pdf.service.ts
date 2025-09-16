import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import puppeteer from 'puppeteer';
import { Note, ExportResult } from './models';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('aws.region');

    this.s3Client = new S3Client({ region });
    this.bucketName =
      this.configService.get<string>('aws.s3.bucketName') ||
      'notes-pdf-exports';
  }

  async generatePdf(note: Note): Promise<ExportResult> {
    try {
      this.logger.log(`Generating PDF for note: ${note.id}`);

      // Generate HTML content for the note
      const htmlContent = this.generateHtmlContent(note);

      // Launch Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
      });

      const page = await browser.newPage();

      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
      });

      await browser.close();

      // Upload to S3
      const fileName = `notes/${note.id}-${Date.now()}.pdf`;
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      });

      await this.s3Client.send(uploadCommand);

      // Generate presigned URL
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
        {
          expiresIn:
            (this.configService.get<number>('pdf.expiryHours') || 1) * 3600,
        }
      );

      const expiryHours =
        this.configService.get<number>('pdf.expiryHours') || 1;
      const expiresAt = new Date(
        Date.now() + expiryHours * 3600 * 1000
      ).toISOString();

      this.logger.log(`PDF generated successfully for note: ${note.id}`);

      return {
        url: signedUrl,
        expiresAt,
      };
    } catch (error: unknown) {
      this.logger.error('Error generating PDF:', error);
      throw error;
    }
  }

  private generateHtmlContent(note: Note): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${note.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
          }
          .header {
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #007acc;
            margin: 0 0 10px 0;
          }
          .meta {
            color: #666;
            font-size: 14px;
          }
          .content {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
            white-space: pre-wrap;
          }
          .tags {
            margin-top: 20px;
          }
          .tag {
            display: inline-block;
            background-color: #f0f8ff;
            color: #007acc;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 8px;
            border: 1px solid #007acc;
          }
          .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${note.title}</h1>
          <div class="meta">
            <div><strong>Created:</strong> ${formatDate(note.createdAt)}</div>
            <div><strong>Last Updated:</strong> ${formatDate(note.updatedAt)}</div>
            <div><strong>Note ID:</strong> ${note.id}</div>
          </div>
        </div>

        <div class="content">
          ${note.content}
        </div>

        ${
          note.tags && note.tags.length > 0
            ? `
        <div class="tags">
          <strong>Tags:</strong><br>
          ${note.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
        </div>
        `
            : ''
        }

        <div class="footer">
          Generated on ${formatDate(new Date().toISOString())} | Notes API
        </div>
      </body>
      </html>
    `;
  }
}
