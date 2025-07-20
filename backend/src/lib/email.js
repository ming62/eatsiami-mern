import nodemailer from "nodemailer";
import "dotenv/config";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (email, resetCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request - EatSiami",
    html: `
    <h2>EatSiami Password Reset</h2>
    <p>Your reset code is: <b>${resetCode}</b></p>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log("Email sent successfully to", email);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
