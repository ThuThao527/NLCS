import jwt from 'jsonwebtoken';



const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access token is required' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  console.log('JWT_SECRET:', jwtSecret); // Log secret key
  console.log('Token received:', token); // Log token

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log('Token verification error:', err.message); // Log lỗi cụ thể
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token has expired' });
      }
      return res.status(403).json({ message: `Invalid token - ${err.message}` });
    }
    console.log('Valid token!');
    console.log('Decoded user from token:', user);
    req.user = user;
    next();
  });
};

export default authenticateToken;