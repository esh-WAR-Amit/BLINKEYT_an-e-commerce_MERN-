const verifyEmailTemplate = ({ name, url }) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
    <h2 style="color: #007bff; text-align: center;">Welcome to BLINKEYIT!</h2>
    <p style="font-size: 16px;">Dear <strong style="color: #000;">${name}</strong>,</p>
    <p style="font-size: 16px; margin: 10px 0;">
      Thank you for registering with <strong>BLINKEYIT</strong>. We're excited to have you on board!
    </p>
    <p style="font-size: 16px; margin: 10px 0;">
      Please confirm your email address by clicking the button below:
    </p>
    <p style="text-align: center; margin-top: 20px;">
      <a 
        href="${url}" 
        style="display: inline-block; background: #28a745; color: #fff; text-decoration: none; font-size: 16px; padding: 12px 25px; border-radius: 5px;">
        Verify Email
      </a>
    </p>
    <p style="font-size: 14px; color: #555; margin-top: 20px;">
      If the button above doesn't work, copy and paste the following link into your browser:
    </p>
    <p style="font-size: 14px; color: #007bff; word-wrap: break-word;">
      <a href="${url}" style="color: #007bff; text-decoration: none;">${url}</a>
    </p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 14px; color: #777; text-align: center;">
      Thanks, <br/> <strong>The BLINKEYIT Team</strong>
    </p>
  </div>
  `;
};

export default verifyEmailTemplate;
