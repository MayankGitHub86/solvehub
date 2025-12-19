const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const authenticate = async (
  req,
  res,
  next
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = { authenticate };
