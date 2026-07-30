// In-memory Map to store OTP records mapped by email address
// Structure: email -> { otp: string, expiresAt: number }
const store = new Map();

// OTP Validity duration: 5 minutes (in milliseconds)
const OTP_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Stores a generated OTP for a specific email address.
 * @param {string} email - The user's email address.
 * @param {string} otp - The 6-digit OTP code.
 */
function saveOTP(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  store.set(normalizedEmail, { otp, expiresAt });
}

/**
 * Verifies the OTP for a specific email address.
 * Matches the OTP, checks expiration, deletes on success to prevent reuse.
 * @param {string} email - The user's email address.
 * @param {string} otp - The OTP code to verify.
 * @returns {{ success: boolean, message: string }} Verification result.
 */
function verifyOTP(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();
  const entry = store.get(normalizedEmail);

  if (!entry) {
    return { success: false, message: 'No OTP requested or OTP has already been verified/expired.' };
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    store.delete(normalizedEmail); // Clean up expired OTP
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Check match
  if (entry.otp !== otp.trim()) {
    return { success: false, message: 'Invalid OTP code.' };
  }

  // OTP is correct and valid: immediately delete from store to prevent reuse
  store.delete(normalizedEmail);
  return { success: true, message: 'OTP verified successfully.' };
}

// Periodically clean up expired OTPs from the map every minute to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(email);
    }
  }
}, 60000).unref(); // Use unref() so this timer doesn't keep the Node.js process alive unnecessarily

module.exports = {
  saveOTP,
  verifyOTP,
  _store: store // Exported for testing/debugging purposes if needed
};
