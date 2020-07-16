import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Vitae Support" <no-reply@vitae.com>',
      to,
      subject,
      text,
      html
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.log("Message Failed:", error.message);
  }
};