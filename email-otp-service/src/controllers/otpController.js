const { generateOTP } = require('../utils/otpGenerator');
const { saveOTP, verifyOTP } = require('../utils/otpStore');
const { sendOTPEmail } = require('../services/emailService');

// Simple regex for basic email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Endpoint: POST /api/send-otp
 * Body: { email }
 */
async function handleSendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required.'
      });
    }

    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    // Generate secure OTP
    const otp = generateOTP();

    // Store OTP mapping
    saveOTP(trimmedEmail, otp);

    // Send the email
    await sendOTPEmail(trimmedEmail, otp);

    // Log internally for development (do not send OTP in response payload!)
    console.log(`[OTP Sent Successfully] Email: ${trimmedEmail} (OTP generated)`);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Error in send-otp handler:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while sending the verification code.'
    });
  }
}

/**
 * Endpoint: POST /api/verify-otp
 * Body: { email, otp }
 */
function handleVerifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Both email and otp fields are required.'
      });
    }

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (trimmedOtp.length !== 6 || isNaN(Number(trimmedOtp))) {
      return res.status(400).json({
        success: false,
        error: 'OTP must be a 6-digit numeric code.'
      });
    }

    const result = verifyOTP(trimmedEmail, trimmedOtp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in verify-otp handler:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred during OTP verification.'
    });
  }
}

module.exports = {
  handleSendOTP,
  handleVerifyOTP
};
