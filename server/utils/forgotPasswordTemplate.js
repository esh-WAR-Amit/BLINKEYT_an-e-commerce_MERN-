const forgotPasswordTemplate = ({ name, otp }) => {
  console.log(name);
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
    <h2 style="color: #007bff; text-align: center;">Password Reset Request</h2>
    <p style="font-size: 16px;">Dear <strong style="color: #000;">${name}</strong>,</p>
    <p style="font-size: 16px; margin: 10px 0;">We received a request to reset the password for your <strong>BLINKEYT</strong> account. Please use the OTP below to reset your password:</p>
    <div style="background: #fffbe5; padding: 20px; text-align: center; border-radius: 8px; border: 1px dashed #ffc107; margin: 20px 0;">
      <p style="font-size: 20px; color: #333; margin: 0;">Your OTP:</p>
      <p style="font-size: 28px; font-weight: bold; color: #28a745; margin: 10px 0;">${otp}</p>
    </div>
    <p style="font-size: 16px; color: #555;">This OTP is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.</p>
    <p style="text-align: center; margin-top: 20px;">
      <a href="https://www.blinkeyt.com/reset-password" style="display: inline-block; background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 10px;">Reset Password</a>
    </p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 14px; color: #777; text-align: center;">Thanks,</p>
    <p style="font-size: 14px; color: #777; text-align: center;"><strong>BLINKEYT Team</strong></p>
  </div>
  `;
};

export default forgotPasswordTemplate;
