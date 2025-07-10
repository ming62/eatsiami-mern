import User from "../models/User.js";
import { sendEmail } from "../lib/email.js";


const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(200).json({
        message:
          "Sending a password reset email if the email exists in our system.",
      });
    }

    const resetCode = generateResetCode();
    const resetExpiry = new Date(Date.now() + 10 * 60 * 1000); 

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = resetExpiry;
    await user.save();

    const emailResult = await sendEmail(email, resetCode);
    if (!emailResult.success) {
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.status(200).json({
      message: "Reset code sent to your email",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const verifyResetCode = async (req, res) => {
    try {
        const { email, resetCode } = req.body;

        if (!email || !resetCode) {
            return res.status(400).json({ message: "Email and reset code are required" });
        }

        const user = await User.findOne({
            email: email,
            resetPasswordToken: resetCode,
            resetPasswordExpires: { $gt: new Date() }, 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        res.status(200).json({ message: "Reset code is valid" });
    } catch (error) {
        console.error("Error verifying reset code:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;
        if (!email || !resetCode || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const user = await User.findOne({
            email: email,
            resetPasswordToken: resetCode,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        user.password = newPassword; 
        user.resetPasswordToken = null; 
        user.resetPasswordExpires = null; 
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};