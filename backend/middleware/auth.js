import jwt from 'jsonwebtoken';

// Middleware để xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token has expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user; // Lưu thông tin người dùng từ token vào req.user
    next();
  });
};

export default authenticateToken;