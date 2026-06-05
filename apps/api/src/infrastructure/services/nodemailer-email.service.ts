import nodemailer from 'nodemailer';

export class NodemailerEmailService {
  private transporterPromise: Promise<nodemailer.Transporter> | null = null;
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;
    if (this.transporterPromise) return this.transporterPromise;

    this.transporterPromise = (async () => {
      const host = process.env.SMTP_HOST;
      if (host && host.trim() !== '') {
        console.log('[EMAIL] Using configured SMTP settings:', host);
        this.transporter = nodemailer.createTransport({
          host,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        console.log('[EMAIL] No SMTP host configured. Creating temporary Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        console.log('[EMAIL] Ethereal test account created successfully:');
        console.log(`- User: ${testAccount.user}`);
        console.log(`- Pass: ${testAccount.pass}`);
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }
      return this.transporter;
    })();

    return this.transporterPromise;
  }

  async sendMail(options: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> {
    const transporter = await this.getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'PTIT Equipment Management <noreply@ptit.edu.vn>';
    const info = await transporter.sendMail({
      from: fromAddress,
      ...options,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL SENT] Preview URL: ${previewUrl}`);
      (info as any).previewUrl = previewUrl;
    }
    return info;
  }
}
