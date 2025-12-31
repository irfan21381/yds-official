/* ======================================================
   🔁 Reset Password (Forgot Password via OTP)
====================================================== */
export const resetPasswordWithOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new CustomError("Email, OTP and new password required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("User not found", 404);

    if (!user.otpSecret || user.otpSecret !== otp) {
      throw new CustomError("Invalid OTP", 400);
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      throw new CustomError("OTP expired", 400);
    }

    user.password = newPassword;
    user.otpSecret = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    next(err);
  }
};
