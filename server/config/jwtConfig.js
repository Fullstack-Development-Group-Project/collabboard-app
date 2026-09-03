const crypto = require('crypto');

// Generate a random cryptographic string on boot if JWT_SECRET is missing.
// This ensures the server can run securely, but tokens will be invalidated on restart.
const generateFallbackSecret = () => {
  console.warn('WARNING: JWT_SECRET environment variable is missing.');
  console.warn('Generating a temporary random cryptographic secret for this session.');
  console.warn('All issued tokens will be invalidated when the server restarts.');
  return crypto.randomBytes(64).toString('hex');
};

const JWT_SECRET = process.env.JWT_SECRET || generateFallbackSecret();

module.exports = { JWT_SECRET };
