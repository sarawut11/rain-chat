import * as nodemailer from "nodemailer";
import * as path from "path";
import * as fs from "fs";
import * as moment from "moment";

const EMAIL_PATH: string = process.env.EMAIL_PATH;
const HOST: string = process.env.HOST;

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (mailPath: string, { email, subject, data }: {
  email: string,
  subject: string,
  data?: {
    username?: string,
    code?: string,
    expire?: number,
  }
}) => {
  try {
    mailPath = path.join(EMAIL_PATH, mailPath);
    let html = (await fs.readFileSync("." + mailPath)).toString();
    html = html.replace(/{{HOST}}/g, `https://${HOST}`);
    html = html.replace(/{{EMAIL_PATH}}/g, `https://${path.join(HOST, EMAIL_PATH)}`);
    html = html.replace(/{{COPYRIGHT_YEAR}}/g, moment().utc().year().toString());

    if (data.username !== undefined) html = html.replace(/{{USERNAME}}/g, data.username);
    if (data.code !== undefined) html = html.replace(/{{CODE}}/g, data.code);
    if (data.expire !== undefined) html = html.replace(/{{EXPIRE}}/g, (data.expire / 60000).toString());

    const info = await transporter.sendMail({
      from: `"VitaeRain.Chat" <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      html
    });

    console.log(`Message => Sent to ${email}, MessageId: ${info.messageId}`);
  } catch (error) {
    console.log("Message => Failed:", error.message);
  }
};