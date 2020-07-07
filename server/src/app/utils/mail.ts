import * as nodemailer from "nodemailer";
import configs from "@configs";

const transporter = nodemailer.createTransport({
  service: configs.mail.service,
  auth: {
    user: configs.mail.user,
    pass: configs.mail.pass,
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