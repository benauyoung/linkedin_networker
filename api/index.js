// Simple handler for Vercel serverless function
module.exports = (req, res) => {
  res.status(200).json({ message: 'LinkedIn Networker API is running' });
};
