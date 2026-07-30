const crypto = require('crypto');

/**
 * Securely generates a random 6-digit numeric OTP.
 * @returns {string} The 6-digit OTP.
 */
function generateOTP() {
  // crypto.randomInt is cryptographically secure and generates a number in the range [min, max)
  const otpVal = crypto.randomInt(100000, 1000000);
  return otpVal.toString();
}

module.exports = { generateOTP };
