import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import axios from 'axios';
import util from 'util';
import { constrainedMemory } from 'process';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authenticateToken from './middleware/auth.js';
import { fileURLToPath } from 'url';


dotenv.config();
console.log('JWT_SECRET right after dotenv:', process.env.JWT_SECRET);
const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' })); // Tăng giới hạn payload JSON
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use(
  cors({
    // origin: 'http://localhost:5175', // Cho phép yêu cầu từ front-end trên cổng 5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Cho phép các phương thức HTTP này
    // allowedHeaders: ['Content-Type', 'Authorization'], // Các headers được phép
  })
);

app.use(express.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});


// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Tên file duy nhất
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file: 5MB
});



const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.PASSWORD_MYSQL,
  database: 'TourManagement',
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00'
});

// Kiểm tra kết nối
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
})();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

////////////////////////////////////////////////////////////////////////////////

// 2. API Cập nhật Helper (Update)
app.put('/api/helpersUpdate/:id', authenticateToken, upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const { HelperName, Email, Phone } = req.body;

  if (req.user.role !== 'Admin' && req.user.userId !== parseInt(id)) {
    console.log('Authorization failed:', {
      userId: req.user.userId,
      role: req.user.role,
      requestedId: id,
    });
    return res.status(403).json({ message: 'You are not authorized to update this helper' });
  }

  if (!HelperName || !Email || !Phone) {
    console.log('Validation failed: Missing required fields', { HelperName, Email, Phone });
    return res.status(400).json({ message: 'HelperName, Email, and Phone are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email)) {
    console.log('Validation failed: Invalid email format', { Email });
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    let avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    console.log('Avatar upload result:', { avatarUrl });

    const updateFields = [HelperName, Email, Phone];
    let query = `UPDATE Helper SET HelperName = ?, Email = ?, Phone = ?`;
    if (avatarUrl) {
      query += `, IMG_Helper = ?`;
      updateFields.push(avatarUrl);
    }
    updateFields.push(id);
    query += ` WHERE HelperID = ?`;

    const [result] = await pool.query(query, updateFields);

    if (result.affectedRows === 0) {
      console.log('Update failed: Helper not found', { id });
      return res.status(404).json({ message: 'Helper not found' });
    }

    console.log('Helper updated successfully:', { id, HelperName, Email, Phone, avatarUrl });
    res.status(200).json({ message: 'Helper updated successfully', avatarUrl });
  } catch (error) {
    console.error('Error updating helper:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Failed to update helper', error: error.message });
  }
});
// 3. API Xóa Helper (Delete)
app.put('/api/helpersUpdate/:id', authenticateToken, upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const { HelperName, Email, Phone } = req.body;

  if (req.user.role !== 'Admin' && req.user.userId !== parseInt(id)) {
    console.log('Authorization failed:', {
      userId: req.user.userId,
      role: req.user.role,
      requestedId: id,
    });
    return res.status(403).json({ message: 'You are not authorized to update this helper' });
  }

  if (!HelperName || !Email || !Phone) {
    console.log('Validation failed: Missing required fields', { HelperName, Email, Phone });
    return res.status(400).json({ message: 'HelperName, Email, and Phone are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email)) {
    console.log('Validation failed: Invalid email format', { Email });
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    let avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    console.log('Avatar upload result:', { avatarUrl });

    const updateFields = [HelperName, Email, Phone];
    let query = `UPDATE Helper SET HelperName = ?, Email = ?, Phone = ?`;
    if (avatarUrl) {
      query += `, IMG_Helper = ?`;
      updateFields.push(avatarUrl);
    }
    updateFields.push(id);
    query += ` WHERE HelperID = ?`;

    const [result] = await pool.query(query, updateFields);

    if (result.affectedRows === 0) {
      console.log('Update failed: Helper not found', { id });
      return res.status(404).json({ message: 'Helper not found' });
    }

    console.log('Helper updated successfully:', { id, HelperName, Email, Phone, avatarUrl });
    res.status(200).json({ message: 'Helper updated successfully', avatarUrl });
  } catch (error) {
    console.error('Error updating helper:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Failed to update helper', error: error.message });
  }
});


// Hàm tính TotalCost (tái sử dụng từ API trước đó)
async function calculateTotalCost(helperId, startTime, endTime) {
  try {
    const bookingDate = startTime.split(' ')[0]; // Lấy ngày từ StartTime (VD: '2025-03-25')
    const start = new Date(startTime);
    const end = new Date(endTime);
    let totalCost = 0.0;
    let currentTime = new Date(start);

    // Truy vấn các mức giá áp dụng từ HelperRate
    const [rates] = await pool.query(
      `
      SELECT StartTime, EndTime, Rate
      FROM HelperRate
      WHERE HelperID = ?
        AND StartDate <= ?
        AND (EndDate IS NULL OR EndDate >= ?)
      `,
      [helperId, bookingDate, bookingDate]
    );

    if (rates.length === 0) {
      throw new Error('No applicable rate found for the given helper and date');
    }

    // Tính TotalCost bằng cách chia nhỏ thời gian
    while (currentTime < end) {
      let applicableRate = null;
      let rateEndTime = null;

      // Tìm mức giá áp dụng cho thời điểm hiện tại
      for (const rate of rates) {
        const rateStart = new Date(`${bookingDate}T${rate.StartTime}`);
        const rateEnd = new Date(`${bookingDate}T${rate.EndTime}`);
        if (currentTime >= rateStart && currentTime < rateEnd) {
          applicableRate = rate.Rate;
          rateEndTime = rateEnd;
          break;
        }
      }

      if (!applicableRate) {
        throw new Error('No applicable rate found for the given time');
      }

      // Tính thời gian trong khung giờ này
      const nextTime = new Date(Math.min(end, rateEndTime));
      const duration = (nextTime - currentTime) / (1000 * 60 * 60); // Chuyển thành giờ
      const cost = duration * applicableRate;
      totalCost += cost;

      // Chuyển đến khung giờ tiếp theo
      currentTime = nextTime;
    }

    return totalCost;
  } catch (error) {
    throw new Error(`Error calculating total cost: ${error.message}`);
  }
}

// Hàm tính Total_Hours từ Booking
async function getTotalHoursByHelper(helperId) {
  try {
    const [bookings] = await pool.query(
      `SELECT TIMESTAMPDIFF(SECOND, StartTime, EndTime) as seconds 
       FROM booking 
       WHERE HelperID = ? AND status = 'completed'`,
      [helperId]
    );

    const totalSeconds = bookings.reduce((sum, booking) => sum + booking.seconds, 0);
    const totalHours = totalSeconds / 3600;
    return parseFloat(totalHours.toFixed(2));
  } catch (error) {
    throw new Error(`Error calculating total hours: ${error.message}`);
  }
}
// Hàm tính Average_star từ Review
async function getAverageRatingByHelper(helperId) {
  try {
    // Làm tròn 1 số thập phân
    const [result] = await pool.query(
      `SELECT 
        ROUND(AVG(r.Rating), 1) as avgRating,
        COUNT(r.ReviewID) as reviewCount
      FROM Booking b
      JOIN Review r ON b.BookingID = r.BookingID
      WHERE b.HelperID = ? 
        AND b.status = 'completed'
        AND r.Rating BETWEEN 1 AND 5`,
      [helperId]
    );

    return {
      averageRating: result[0].avgRating || 0,
      totalReviews: result[0].reviewCount
    };
  } catch (error) {
    throw new Error(`Error calculating average rating: ${error.message}`);
  }
}

// API lấy tổng giờ làm
app.get('/api/helpers/:helperId/total-hours', async (req, res) => {
  try {
    const totalHours = await getTotalHoursByHelper(req.params.helperId);
    res.json({ totalHours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API lấy điểm trung bình
app.get('/api/helpers/:helperId/rating-stats', async (req, res) => {
  try {
    const ratingStats = await getAverageRatingByHelper(req.params.helperId);
    res.json(ratingStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API để upload ảnh
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  console.log(req.body);

  const imagePath = `http://localhost:${port}/uploads/${req.file.filename}`;
  res
    .status(200)
    .json({ message: 'Upload succsessfully', imageUrl: imagePath });
});

////////////////////////////////////////////////////////////////////////////////////

// Số vòng lặp để tăng độ phức tạp của thuật toán băm
const saltRounds = 10;

// Hàm băm mật khẩu
async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Lỗi khi băm mật khẩu:', error);
    throw error;
  }
}

async function comparePassword(password, hashedPassword) {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match; // Trả về true nếu mật khẩu khớp, false nếu sai
  } catch (error) {
    console.error('Lỗi khi so sánh mật khẩu:', error);
    throw error;
  }
}


// Hàm tạo user (cho Customer và Admin)
const createUser = (pool, userData, callback) => {
  const { Email, FullName, PhoneNumber, Address, Password, Role, AvatarUrl } = userData;

  // Băm mật khẩu
  hashPassword(Password.trim())
    .then((hashedPassword) => {
      pool.query(
        `
        INSERT INTO User (Email, Password, FullName, PhoneNumber, Address, AvatarUrl, Role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [Email, hashedPassword, FullName, PhoneNumber, Address, AvatarUrl || null, Role],
        (err, result) => {
          if (err) {
            return callback(err);
          }

          pool.query(
            `SELECT UserID, Email, FullName, PhoneNumber, Address, AvatarUrl, Role FROM User WHERE UserID = ?`,
            [result.insertId],
            (err, newUser) => {
              if (err) {
                return callback(err);
              }
              callback(null, newUser[0]);
            }
          );
        }
      );
    })
    .catch((err) => callback(err));
};

// Hàm tạo helper
const createHelper = (pool, helperData, callback) => {
  const { Email, HelperName, Phone, Address, Password, IMG_Helper } = helperData;

  // Băm mật khẩu
  hashPassword(Password.trim())
    .then((hashedPassword) => {
      pool.query(
        `
        INSERT INTO Helper (Email, Password, HelperName, Phone, Address, IMG_Helper)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [Email, hashedPassword, HelperName, Phone, Address, IMG_Helper || null],
        (err, result) => {
          if (err) {
            return callback(err);
          }

          pool.query(
            `SELECT HelperID, Email, HelperName, Phone, Address, IMG_Helper FROM Helper WHERE HelperID = ?`,
            [result.insertId],
            (err, newHelper) => {
              if (err) {
                return callback(err);
              }
              callback(null, {
                ...newHelper[0],
                FullName: newHelper[0].HelperName,
                PhoneNumber: newHelper[0].Phone,
                AvatarUrl: newHelper[0].IMG_Helper,
                Role: 'Helper',
              });
            }
          );
        }
      );
    })
    .catch((err) => callback(err));
};

// API đăng ký
app.post('/api/register', async (req, res) => {
  const { Email, FullName, PhoneNumber, Address, Password, Role, AvatarUrl } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!Email || !Password || !FullName || !PhoneNumber || !Address || !Role) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Email, Password, FullName, PhoneNumber, Address, and Role are required' });
    }

    // Kiểm tra Role hợp lệ
    const validRoles = ['Admin', 'Customer', 'Helper'];
    if (!validRoles.includes(Role)) {
      console.log('Invalid Role:', Role);
      return res.status(400).json({ message: 'Role must be either Admin, Customer, or Helper' });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Kiểm tra mật khẩu phức tạp
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(Password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      });
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(PhoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format (e.g., +84888211527)' });
    }

    // Kiểm tra email trùng lặp trong bảng User
    console.log('Checking email in User table...');
    const [existingUser] = await pool.query(`SELECT * FROM User WHERE Email = ?`, [Email]);
    console.log('Existing user result:', existingUser);

    // Kiểm tra email trùng lặp trong bảng Helper
    console.log('Checking email in Helper table...');
    const [existingHelper] = await pool.query(`SELECT * FROM Helper WHERE Email = ?`, [Email]);
    console.log('Existing helper result:', existingHelper);

    if (existingUser.length > 0 || existingHelper.length > 0) {
      console.log('Email already exists:', Email);
      return res.status(400).json({
        message: "This Account already exists, let's Sign In",
      });
    }

    // Băm mật khẩu
    const hashedPassword = await hashPassword(Password.trim());

    // Tạo user hoặc helper dựa trên Role
    if (Role === 'Helper') {
      console.log('Creating Helper...');
      const [result] = await pool.query(
        `
        INSERT INTO Helper (Email, Password, HelperName, Phone, Address, IMG_Helper)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [Email, hashedPassword, FullName, PhoneNumber, Address, AvatarUrl || null]
      );

      const [newHelper] = await pool.query(
        `SELECT HelperID, Email, HelperName, Phone, Address, IMG_Helper FROM Helper WHERE HelperID = ?`,
        [result.insertId]
      );

      res.status(201).json({
        message: 'Account created successfully!',
        user: {
          ...newHelper[0],
          FullName: newHelper[0].HelperName,
          PhoneNumber: newHelper[0].Phone,
          AvatarUrl: newHelper[0].IMG_Helper,
          Role: 'Helper',
        },
      });
    } else {
      console.log('Creating User...');
      const [result] = await pool.query(
        `
        INSERT INTO User (FullName, Email, PhoneNumber, Password, AvatarUrl, isDeleted, Address,  Role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [FullName, Email, PhoneNumber, hashedPassword, AvatarUrl || null, null , Address,  Role]
      );

      const [newUser] = await pool.query(
        `SELECT UserID, FullName, Email, PhoneNumber, Password, AvatarUrl, isDeleted, Address,  Role  FROM User WHERE UserID = ?`,
        [result.insertId]
      );

      res.status(201).json({
        message: 'Account created successfully!',
        user: newUser[0],
      });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Error during registration', error: error.message });
  }
});

// API đăng nhập bằng google
app.post('/api/google-login', async (req, res) => {
  const { Email, FullName, AvatarUrl } = req.body;

  try {
    const [results] = await pool.query('SELECT * FROM user WHERE email = ?', [Email]);

    if (results.length > 0) {
      res.status(200).json({ message: 'Đăng nhập thành công!', user: results[0] });
    } else {
      const [result] = await pool.query(
        'INSERT INTO user (fullname, email, avatarurl) VALUES (?, ?, ?)',
        [FullName, Email, AvatarUrl]
      );
      const queryGetId = result.insertId;
      res.status(200).json({
        message: 'Tạo tài khoản mới và đăng nhập thành công!',
        user: {
          UserID: queryGetId,
          FullName: FullName,
          Email: Email,
          Role: 'user',
          AvatarUrl: AvatarUrl,
        },
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Lỗi khi truy vấn cơ sở dữ liệu', error: error.message });
  }
});


app.post('/api/login', async (req, res) => {
  const { Email } = req.body;
  let { Password } = req.body;
  Password = Password.trim();

  try {
    if (!Email || !Password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const [userResults] = await pool.query(`SELECT * FROM User WHERE Email = ?`, [Email]);

    if (userResults.length > 0) {
      const user = userResults[0];
      const isPasswordValid = await bcrypt.compare(Password, user.Password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user.UserID, email: user.Email, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          UserID: user.UserID,
          Email: user.Email,
          FullName: user.FullName,
          PhoneNumber: user.PhoneNumber,
          Address: user.Address,
          AvatarUrl: user.AvatarUrl,
          Role: user.Role,
        },
      });
    } else {
      const [helperResults] = await pool.query(`SELECT * FROM Helper WHERE Email = ?`, [Email]);
      if (helperResults.length === 0) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const helper = helperResults[0];
      const isPasswordValid = await bcrypt.compare(Password, helper.Password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: helper.HelperID, email: helper.Email, role: 'Helper' },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          UserID: helper.HelperID,
          Email: helper.Email,
          FullName: helper.HelperName,
          PhoneNumber: helper.Phone,
          Address: helper.Address,
          AvatarUrl: helper.IMG_Helper,
          Role: 'Helper',
        },
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

app.post('/api/login/admin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
    pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ message: 'Database error', error: err.message });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        // Kiểm tra mật khẩu
        const isPasswordValid = password == user.password;
        if (!isPasswordValid) {
          return res.status(400).json({
            message:
              "Invalid email or password or you register by google before, Let's login by google",
          });
        }

        // Tạo token JWT
        // const token = jwt.sign(
        //   { id: user.id, email: user.email, role: user.role },
        //   secretKey,
        //   { expiresIn: '1h' } // Thời gian hết hạn token
        // );

        res.status(200).json({
          message: 'Login successful',
          user: results[0],
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});


// API Proxy để tải file PDF từ Google Drive
app.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;

    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // Đặt tiêu đề Content-Type để trình duyệt biết đây là file PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline'); // Hiển thị trực tiếp
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching PDF:', error.message);
    res.status(500).send('Error fetching PDF');
  }
});


// 1. GET /availability - Lấy danh sách ngày và ca của Helper
app.get('/availability', async (req, res) => {
  const { helperId } = req.query;
  console.log(`Received GET /availability with helperId: ${helperId}`);

  if (!helperId) {
    console.log('Error: Missing helperId in query');
    return res.status(400).json({ error: 'HelperID is required' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT a.Date, s.Session
       FROM availability a
       LEFT JOIN availability_sessions s ON a.AvailabilityID = s.AvailabilityID
       WHERE a.HelperID = ?`,
      [helperId]
    );

    const dateShifts = {};
    rows.forEach(row => {
      const dateString = new Date(row.Date).toISOString().split('T')[0];
      if (!dateShifts[dateString]) dateShifts[dateString] = [];
      if (row.Session) dateShifts[dateString].push(row.Session.replace(' ', ''));
    });

    console.log(`Success: Fetched availability for HelperID ${helperId}`, dateShifts);
    res.json(dateShifts);
  } catch (error) {
    console.error(`Error fetching availability for HelperID ${helperId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. POST /availability - Thêm ngày và ca mới
app.post('/availabilityUpdate', async (req, res) => {
  const { helperId, dates, shifts } = req.body;

  if (!helperId || !dates || !shifts || !Array.isArray(dates) || !Array.isArray(shifts)) {
    console.log('Error: Invalid request body', { helperId, dates, shifts });
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const validShifts = ['shift1', 'shift2', 'shift3', 'fullday'];
  if (!shifts.every(shift => validShifts.includes(shift))) {
    console.log('Error: Invalid shift values', shifts);
    return res.status(400).json({ error: 'Invalid shift values' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const date of dates) {
      // Kiểm tra xem ngày đã tồn tại chưa
      const [existing] = await connection.execute(
        'SELECT AvailabilityID FROM availability WHERE HelperID = ? AND Date = ?',
        [helperId, date]
      );

      let availabilityId;
      if (existing.length > 0) {
        availabilityId = existing[0].AvailabilityID;
        // Xóa các ca cũ để cập nhật
        await connection.execute(
          'DELETE FROM availability_sessions WHERE AvailabilityID = ?',
          [availabilityId]
        );
        console.log(`Cleared old shifts for date ${date}, HelperID ${helperId}`);
      } else {
        // Thêm bản ghi mới vào availability
        const [result] = await connection.execute(
          'INSERT INTO availability (HelperID, Date, Status) VALUES (?, ?, ?)',
          [helperId, date, 'Available']
        );
        availabilityId = result.insertId;
        console.log(`Inserted new availability: Date ${date}, HelperID ${helperId}, AvailabilityID ${availabilityId}`);
      }

      // Thêm các ca vào availability_sessions
      const shiftValues = shifts.map(shift => [availabilityId, shift.replace('shift', 'shift ')]); // Chuyển 'shift1' -> 'shift 1'
      await connection.query(
        'INSERT INTO availability_sessions (AvailabilityID, Session) VALUES ?',
        [shiftValues]
      );
      console.log(`Inserted shifts for date ${date}:`, shifts);
    }

    await connection.commit();
    console.log(`Success: Saved availability for HelperID ${helperId}`, { dates, shifts });
    res.status(201).json({ message: 'Availability saved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(`Error saving availability for HelperID ${helperId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// 3. DELETE /availability/:date - Xóa ca của một ngày
app.delete('/availability/:date', async (req, res) => {
  const { date } = req.params;
  const { helperId } = req.query;

  if (!helperId || !date) {
    console.log('Error: Missing helperId or date', { helperId, date });
    return res.status(400).json({ error: 'HelperID and date are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT AvailabilityID FROM availability WHERE HelperID = ? AND Date = ?',
      [helperId, date]
    );

    if (rows.length === 0) {
      console.log(`No availability found for date ${date}, HelperID ${helperId}`);
      return res.status(404).json({ error: 'Availability not found' });
    }

    const availabilityId = rows[0].AvailabilityID;

    await connection.execute(
      'DELETE FROM availability_sessions WHERE AvailabilityID = ?',
      [availabilityId]
    );
    await connection.execute(
      'DELETE FROM availability WHERE AvailabilityID = ?',
      [availabilityId]
    );

    await connection.commit();
    console.log(`Success: Deleted availability for date ${date}, HelperID ${helperId}`);
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(`Error deleting availability for date ${date}, HelperID ${helperId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});


app.post('/helperRate', async (req, res) => {
  const { helperId, rates } = req.body;

  if (!helperId || !Array.isArray(rates)) {
    return res.status(400).json({ error: 'Invalid request: helperId and rates array are required' });
  }

  try {
    // Xóa các bản ghi cũ của helper
    await pool.query('DELETE FROM HelperRate WHERE HelperID = ?', [helperId]);

    // Thêm các bản ghi mới
    for (const rate of rates) {
      await pool.query(
        `INSERT INTO HelperRate (HelperID, StartDate, EndDate, StartTime, EndTime, Rate, MinDays, MaxDays)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          helperId,
          rate.StartDate || null,
          rate.EndDate || null,
          rate.StartTime || null,
          rate.EndTime || null,
          rate.Rate,
          rate.MinDays || null,
          rate.MaxDays || null
        ]
      );
    }

    console.log(`Saved rates for HelperID ${helperId}:`, rates);
    res.status(200).json({ message: 'Rates saved successfully' });
  } catch (error) {
    console.error(`Error saving rates for HelperID ${helperId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/helperRate/create', async (req, res) => {
  const { helperId, startDate, endDate, startTime, endTime, rate, minDays, maxDays } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!helperId || !rate) {
    return res.status(400).json({ error: 'Invalid request: helperId and rate are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO HelperRate (HelperID, StartDate, EndDate, StartTime, EndTime, Rate, MinDays, MaxDays)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        helperId,
        startDate || null,
        endDate || null,
        startTime || null,
        endTime || null,
        rate,
        minDays || null,
        maxDays || null
      ]
    );

    const newRate = {
      RateID: result.insertId,
      HelperID: helperId,
      StartDate: startDate || null,
      EndDate: endDate || null,
      StartTime: startTime || null,
      EndTime: endTime || null,
      Rate: rate,
      MinDays: minDays || null,
      MaxDays: maxDays || null
    };

    console.log(`Created new rate for HelperID ${helperId}:`, newRate);
    res.status(201).json({ message: 'Rate created successfully', rate: newRate });
  } catch (error) {
    console.error('Error creating rate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/helperRate/:helperId', async (req, res) => {
  const helperId = parseInt(req.params.helperId);

  // Kiểm tra dữ liệu đầu vào
  if (isNaN(helperId)) {
    return res.status(400).json({ error: 'Invalid request: helperId must be a number' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT RateID, HelperID, StartDate, EndDate, StartTime, EndTime, Rate, MinDays, MaxDays 
       FROM HelperRate 
       WHERE HelperID = ?`,
      [helperId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No rates found for this helperId' });
    }

    const rates = rows.map(row => ({
      RateID: row.RateID,
      HelperID: row.HelperID,
      StartDate: row.StartDate,
      EndDate: row.EndDate,
      StartTime: row.StartTime,
      EndTime: row.EndTime,
      Rate: parseFloat(row.Rate), // Chuyển DECIMAL thành number
      MinDays: row.MinDays,
      MaxDays: row.MaxDays
    }));

    console.log(`Fetched rates for HelperID ${helperId}:`, rates);
    res.status(200).json(rates);
  } catch (error) {
    console.error('Error fetching helperRate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Giả sử bạn dùng Express và MySQL
app.delete('/helperRateDelete/:rateId', async (req, res) => {
  const rateId = req.params.rateId;
  try {
    const [result] = await pool.query('DELETE FROM HelperRate WHERE RateID = ?', [rateId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Phí không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa phí thành công' });
  } catch (error) {
    console.error('Error deleting rate:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}); 

app.get('/api/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM blog
    INNER JOIN categories ON blog.CategoryID = categories.CategoryID
  `;
  const query = `
    SELECT blog.*, categories.Name
    FROM blog
    INNER JOIN categories ON blog.CategoryID = categories.CategoryID
    LIMIT ? OFFSET ?
  `;

  // Hàm kiểm tra thumbnail
  async function checkThumbnail(url) {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        error: 'Thumbnail URL is missing or invalid',
        thumbnail: null
      };
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        isValid: false,
        error: 'Thumbnail must be a valid HTTP/HTTPS URL',
        thumbnail: url
      };
    }
    try {
      const response = await axios.head(url, { timeout: 5000 });
      const contentType = response.headers['content-type'];
      if (contentType && contentType.startsWith('image/')) {
        return { isValid: true, error: null, thumbnail: url };
      } else {
        return {
          isValid: false,
          error: 'URL does not point to an image (invalid Content-Type)',
          thumbnail: url
        };
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response) {
        errorMessage = `HTTP error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Domain not found';
      } else {
        errorMessage = error.message;
      }
      return { isValid: false, error: errorMessage, thumbnail: url };
    }
  }

  try {
    const [countResults] = await pool.query(countQuery);
    const totalPosts = countResults[0].total;
    const totalPages = Math.ceil(totalPosts / limit);

    const [results] = await pool.query(query, [limit, offset]);

    const postsWithThumbnailCheck = await Promise.all(
      results.map(async (post) => {
        const thumbnailCheck = await checkThumbnail(post.thumbnail);
        return {
          ...post,
          thumbnailStatus: {
            isValid: thumbnailCheck.isValid,
            error: thumbnailCheck.error,
            thumbnail: thumbnailCheck.thumbnail
          }
        };
      })
    );

    res.json({
      posts: postsWithThumbnailCheck,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPosts: totalPosts,
        postsPerPage: limit
      }
    });
  } catch (err) {
    console.log('Error retrieving blog posts:', err);
    res.status(500).json({ message: 'Error retrieving blog posts', error: err.message });
  }
});
app.get('/api/posts/:id', async (req, res) => {
  const blogId = req.params.id;
  const query = `
    SELECT blog.*, categories.Name
    FROM blog
    INNER JOIN categories ON blog.CategoryID = categories.CategoryID
    WHERE blog.BlogID = ?
  `;

  try {
    const [results] = await pool.query(query, [blogId]);
    if (results.length === 0) {
      console.log('Blog not found');
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.log('Error retrieving blog post:', err);
    res.status(500).json({ message: 'Error retrieving blog post', error: err.message });
  }
});

// API lấy helper theo ngày
app.get('/api/helpers/available', authenticateToken, async (req, res) => {
  const { date, page = 1, limit = 10 } = req.query;
  console.log(`Received GET /api/helpers/available with date: ${date}, page: ${page}, limit: ${limit}`);

  if (!date) {
    console.log('Error: Missing date in query');
    return res.status(400).json({ error: 'Date is required' });
  }

  const offset = (page - 1) * limit;

  try {
    const [countRows] = await pool.execute(
      `SELECT COUNT(DISTINCT h.HelperID) as total
       FROM Helper h
       JOIN Availability a ON h.HelperID = a.HelperID
       WHERE a.Date = ? AND a.Status = 'Available'`,
      [date]
    );
    const totalHelpers = countRows[0].total;
    const totalPages = Math.ceil(totalHelpers / limit);

    const [rows] = await pool.execute(
      `SELECT 
         h.HelperID, h.HelperName, h.Phone, h.IMG_Helper,
         a.Date, a.AvailabilityID, s.SessionID, s.Session,
         hr.StartTime, hr.EndTime, hr.Rate, hr.MinDays, hr.MaxDays
       FROM Helper h
       JOIN Availability a ON h.HelperID = a.HelperID
       LEFT JOIN Availability_sessions s ON a.AvailabilityID = s.AvailabilityID
       LEFT JOIN helperRate hr ON h.HelperID = hr.HelperID 
         AND a.Date BETWEEN IFNULL(hr.StartDate, a.Date) AND IFNULL(hr.EndDate, a.Date)
       WHERE a.Date = ? AND a.Status = 'Available'
       LIMIT ? OFFSET ?`,
      [date, parseInt(limit), parseInt(offset)]
    );

    const helpersMap = {};
    rows.forEach(row => {
      if (!helpersMap[row.HelperID]) {
        helpersMap[row.HelperID] = {
          HelperID: row.HelperID,
          FullName: row.HelperName,
          PhoneNumber: row.Phone,
          AvatarUrl: row.IMG_Helper,
          Sessions: []
        };
      }
      helpersMap[row.HelperID].Sessions.push({
        AvailabilityID: row.AvailabilityID,
        SessionID: row.SessionID || null,
        Session: row.Session || 'N/A',
        StartTime: row.StartTime || 'N/A',
        EndTime: row.EndTime || 'N/A',
        Rate: row.Rate || 0,
        MinDays: row.MinDays || 0,
        MaxDays: row.MaxDays || Infinity
      });
    });

    const helpers = Object.values(helpersMap);

    console.log(`Success: Fetched ${helpers.length} helpers for date ${date}`);
    res.json({
      helpers,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error(`Error fetching helpers for date ${date}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/availabilities', authenticateToken, async (req, res) => {
  const { 
    date, 
    session, 
    minPrice, 
    maxPrice, 
    numberOfDays, // Thêm tham số mới
    page = 1, 
    limit = 10 
  } = req.query;

  const offset = (page - 1) * limit;
  
  // Truy vấn SQL mới với logic pricing
  let query = `
    SELECT
      h.HelperID,
      h.HelperName,
      h.Phone,
      a.Date AS AvailabilityDate,
      avs.Session AS SessionName,
      hr.Rate AS AppliedRate,
      hr.MinDays,
      hr.MaxDays,
      CASE
        WHEN hr.MinDays = 1 AND hr.MaxDays = 1 THEN 'Giá theo ngày'
        WHEN hr.MinDays > 1 AND hr.MaxDays > hr.MinDays THEN 'Giá theo gói nhiều ngày'
        ELSE 'Giá theo ca'
      END AS RateType
    FROM Helper h
    INNER JOIN Availability a ON h.HelperID = a.HelperID
    INNER JOIN Availability_sessions avs ON a.AvailailityID = avs.AvailailityID
    INNER JOIN HelperRate hr ON h.HelperID = hr.HelperID
    WHERE a.Status = 'Available'
      AND a.Date BETWEEN hr.StartDate AND hr.EndDate
      AND (
        ${numberOfDays ? '? BETWEEN hr.MinDays AND hr.MaxDays' : '(hr.MinDays IS NULL AND hr.MaxDays IS NULL)'}
      )
  `;

  const params = [];
  if (numberOfDays) params.push(numberOfDays);

  // Thêm các điều kiện lọc khác
  if (date) {
    query += ` AND a.Date = ?`;
    params.push(date);
  }
  if (session) {
    query += ` AND avs.Session = ?`;
    params.push(session);
  }
  if (minPrice || maxPrice) {
    query += ` AND hr.Rate BETWEEN ? AND ?`;
    params.push(minPrice || 0, maxPrice || 999999);
  }

  try {
    // Phân trang
    const paginatedQuery = query + ` LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, parseInt(limit), parseInt(offset)];

    // Thực thi truy vấn
    const [rows] = await pool.execute(paginatedQuery, paginatedParams);

    // Định dạng dữ liệu phù hợp với giao diện
    const formattedData = rows.reduce((acc, row) => {
      const existing = acc.find(item => item.HelperID === row.HelperID);
      
      const sessionData = {
        Session: row.SessionName,
        StartTime: row.StartTime,
        EndTime: row.EndTime,
        effectiveRate: row.AppliedRate,
        RateType: row.RateType,
        MinDays: row.MinDays,
        MaxDays: row.MaxDays
      };

      if (existing) {
        existing.Sessions.push(sessionData);
      } else {
        acc.push({
          HelperID: row.HelperID,
          HelperName: row.HelperName,
          Phone: row.Phone,
          Sessions: [sessionData],
          AvailabilityDate: row.AvailabilityDate
        });
      }
      return acc;
    }, []);

    // Đếm tổng bản ghi (sử dụng query gốc không phân trang)
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS subquery`;
    const [countRows] = await pool.execute(countQuery, params);
    
    res.json({
      helpers: formattedData, // Đổi tên endpoint thành helpers để phù hợp FE
      totalPages: Math.ceil(countRows[0].total / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/bookings', async (req, res) => {
  const { UserID, HelperID, TotalCost, Sessions, Status = 'Pending', IsDeleted = null, DateBooking } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!UserID || !HelperID || !TotalCost || !Sessions || !DateBooking) {
    console.log('Missing required fields:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Chuyển DateBooking thành object Date và tăng thêm 1 ngày
  const dateBookingObj = new Date(DateBooking);
  if (isNaN(dateBookingObj.getTime())) {
    return res.status(400).json({ error: 'Invalid DateBooking format. Use YYYY-MM-DD' });
  }
  dateBookingObj.setDate(dateBookingObj.getDate() + 1);
  const adjustedDateBooking = dateBookingObj.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD

  // Bắt đầu transaction
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Chèn booking với DateBooking + 1
    const insertBookingSql = `
      INSERT INTO Booking (UserID, HelperID, TotalCost, Sessions, Status, IsDeleted, DateBooking, CreatedDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [bookingResult] = await connection.execute(insertBookingSql, [
      UserID,
      HelperID,
      TotalCost,
      Sessions,
      Status,
      IsDeleted, // Giá trị này giờ có thể là null
      adjustedDateBooking,
    ]);

    // 2. Cập nhật Availability cho DateBooking + 1
    const updateAvailabilitySql = `
      UPDATE Availability 
      SET Status = 'booked'
      WHERE HelperID = ? 
      AND Date = ?
    `;
    const [availabilityResult] = await connection.execute(updateAvailabilitySql, [
      HelperID,
      adjustedDateBooking,
    ]);

    if (availabilityResult.affectedRows === 0) {
      throw new Error('No matching Availability found to update');
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      message: 'Booking created and availability updated',
      id: bookingResult.insertId,
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    if (connection) {
      await connection.rollback();
    }
    if (err.message === 'No matching Availability found to update') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create booking', details: err.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  let connection;
  try {
    console.log('Authorization header:', req.headers.authorization);
    console.log('req.auth:', req.user);

    // Lấy userId từ req.user (khớp với token)
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserID is required'
      });
    }

    // Lấy connection từ pool
    connection = await pool.getConnection();

    // Thực hiện query với UserID, bao gồm các trường mới
    const [rows] = await connection.execute(`
      SELECT 
        b.BookingID,
        b.UserID,
        b.HelperID,
        b.TotalCost,
        b.Status,
        b.Sessions,
        b.CreatedDate,
        b.IsDeleted,
        b.DateBooking,
        h.HelperName,
        h.Phone
      FROM Booking b
      LEFT JOIN Helper h ON b.HelperID = h.HelperID
      WHERE b.UserID = ?
    `, [userId]);

    // Trả về kết quả
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu',
      error: error.message
    });
  } finally {
    // Giải phóng connection về pool
    if (connection) connection.release();
  }
});

app.delete('/api/bookings/:bookingId', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const bookingId = req.params.bookingId;
    console.log('UserID:', userId, 'BookingID:', bookingId);

    if (!userId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'UserID and BookingID are required',
      });
    }

    console.log('Getting connection...');
    connection = await pool.getConnection();
    console.log('Starting transaction...');
    await connection.beginTransaction();

    // 1. Kiểm tra booking
    console.log('Checking booking...');
    const [bookingRows] = await connection.execute(
      `SELECT HelperID, DateBooking 
       FROM Booking 
       WHERE BookingID = ? 
         AND UserID = ? 
         AND IsDeleted = FALSE`,
      [bookingId, userId]
    );
    console.log('Booking rows:', bookingRows);

    if (bookingRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking not found or already canceled',
      });
    }

    const { HelperID, DateBooking } = bookingRows[0];
    console.log('HelperID:', HelperID, 'DateBooking:', DateBooking);
    const dateBookingObj = new Date(DateBooking);
    console.log('dateBookingObj:', dateBookingObj);
    const dateBookingPlusOne = new Date(dateBookingObj);
    dateBookingPlusOne.setDate(dateBookingObj.getDate() + 1);
    const adjustedDate = dateBookingPlusOne.toISOString().split('T')[0];
    console.log('adjustedDate:', adjustedDate);

    const oneDayBeforeBooking = new Date(dateBookingObj);
    oneDayBeforeBooking.setDate(dateBookingObj.getDate() - 1);
    const currentDate = new Date();
    console.log('currentDate:', currentDate, 'oneDayBeforeBooking:', oneDayBeforeBooking);

    if (currentDate > oneDayBeforeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 1 day before DateBooking',
      });
    }

    // 2. Cập nhật Booking
    console.log('Updating Booking...');
    const [updateBookingResult] = await connection.execute(
      `UPDATE Booking 
       SET IsDeleted = TRUE ,
       status = 'cancel'
       WHERE BookingID = ? 
         AND UserID = ? 
         AND (IsDeleted = NULL OR IsDeleted = FALSE)`,
      [bookingId, userId]
    );
    console.log('Update Booking result:', updateBookingResult);

    if (updateBookingResult.affectedRows === 0) {
      throw new Error('Failed to update Booking');
    }

    // 3. Cập nhật Availability
    console.log('Checking Availability status...');
    const [currentStatus] = await connection.execute(
      'SELECT Status FROM Availability WHERE HelperID = ? AND Date = ?',
      [HelperID, adjustedDate]
    );
    console.log('Current Status:', currentStatus[0]?.Status);

    console.log('Updating Availability...');
    const updateAvailabilitySql = `
      UPDATE Availability 
      SET Status = 'Available'
      WHERE HelperID = ? 
      AND Date = ?
    `;
    const [availabilityResult] = await connection.execute(updateAvailabilitySql, [
      HelperID,
      adjustedDate,
    ]);
    console.log('Availability update result:', availabilityResult);

    if (availabilityResult.affectedRows === 0) {
      console.warn('No Availability updated for HelperID:', HelperID, 'Date:', adjustedDate);
    }

    // Commit transaction
    console.log('Committing transaction...');
    await connection.commit();

    res.json({
      success: true,
      message: 'Booking canceled successfully and availability updated',
    });
  } catch (error) {
    console.error('Error details:', error.message, error.stack);
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy booking',
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/user/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'Customer' && req.user.userId !== parseInt(id)) {
    return res.status(403).json({ message: 'You are not authorized to access this customer' });
  }

  try {
    const [user] = await pool.query(
      `SELECT * FROM User WHERE UserID = ?`,
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      User: user[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user', error: error.message });
  }
});

app.put('/api/user/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  if (req.user.userId !== parseInt(id)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { FullName, Email, PhoneNumber } = req.body;
    
    await pool.query(
      `UPDATE User 
       SET FullName = ?, Email = ?, PhoneNumber = ?
       WHERE UserID = ?`,
      [FullName, Email, PhoneNumber, id]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


// 4. API Lấy thông tin một Helper theo ID (Read)
app.get('/api/helpers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'Helper' && req.user.userId !== parseInt(id)) {
    return res.status(403).json({ message: 'You are not authorized to access this helper' });
  }

  try {
    const [helper] = await pool.query(
      `SELECT * FROM Helper WHERE HelperID = ?`,
      [id]
    );

    if (helper.length === 0) {
      return res.status(404).json({ message: 'Helper not found' });
    }

    res.status(200).json({
      message: 'Helper retrieved successfully',
      helper: helper[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve helper', error: error.message });
  }
});

// 5. API Lấy danh sách Helper (Read)
app.get('/api/helpersList', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10, city } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM Helper`;
    let countQuery = `SELECT COUNT(*) as total FROM Helper`;
    const params = [];

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Lấy danh sách Helper
    const [helpers] = await pool.query(query, params);

    // Lấy tổng số Helper để phân trang
    const [countResult] = await pool.query(countQuery, params.slice(0, params.length - 2));
    const total = countResult[0].total;

    res.status(200).json({
      message: 'Helpers retrieved successfully',
      helpers: helpers,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve helpers', error: error.message });
  }
});

app.get('/api/UserList', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10, city, search } = req.query; // Thêm tham số search
  const offset = (page - 1) * limit;

  try {
    // Khởi tạo truy vấn cơ bản với điều kiện Role = 'Customer' 
    let query = `SELECT * FROM user WHERE Role = 'Customer'`;
    let countQuery = `SELECT COUNT(*) as total FROM user WHERE Role = 'Customer' `;
    const params = [];

    // Lọc theo tên hoặc email nếu có search
    if (search) {
      query += ` AND (FullName LIKE ? OR Email LIKE ?)`;
      countQuery += ` AND (FullName LIKE ? OR Email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Thêm phân trang
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Lấy danh sách user
    const [users] = await pool.query(query, params);

    // Lấy tổng số user để phân trang
    const [countResult] = await pool.query(countQuery, params.slice(0, params.length - 2));
    const total = countResult[0].total;

    res.status(200).json({
      message: 'Users retrieved successfully',
      helpers: users, // Giữ tên "helpers" như cũ để khớp với frontend
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await pool.query(
      `UPDATE user SET IsDeleted = 1 WHERE UserID = ? AND IsDeleted IS NULL`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found or already deleted'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

app.delete('/api/helprs/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await pool.query(
      `UPDATE helper SET IsDeleted = 1 WHERE HelperID = ? AND IsDeleted IS NULL`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Helper not found or already deleted'
      });
    }

    res.status(200).json({
      message: 'Helper deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete helper',
      error: error.message
    });
  }
});

app.get('/api/availability-by-session', authenticateToken, async (req, res) => {
  try {
    const { search, date, sessions, minPrice, maxPrice } = req.query;
    let query = `
      SELECT DISTINCT
        h.HelperID,
        h.HelperName,
        h.Phone,
        DATE(a.Date) AS Date, -- Chỉ lấy phần ngày
        avs.Session,
        COALESCE(hr_shift.Rate, hr.Rate) AS Rate
      FROM Helper h
      INNER JOIN Availability a ON a.HelperID = h.HelperID
      INNER JOIN Availability_sessions avs ON avs.AvailabilityID = a.AvailabilityID
      INNER JOIN HelperRate hr ON hr.HelperID = h.HelperID
      LEFT JOIN HelperRate hr_shift ON hr_shift.HelperID = h.HelperID
        AND (
          (avs.Session = 'shift 1' AND hr_shift.StartTime = '07:00:00') OR
          (avs.Session = 'shift 2' AND hr_shift.StartTime = '13:00:00') OR
          (avs.Session = 'shift 3' AND hr_shift.StartTime = '18:00:00')
        )
      WHERE a.Status = 'Available'
    `;
    const params = [];

    if (search) {
      query += ' AND h.HelperName LIKE ?';
      params.push(`%${search}%`);
    }
    if (date) {
      query += ' AND DATE(a.Date) = ?';
      params.push(date);
    }
    if (sessions) {
      const sessionArray = sessions.split(',');
      query += ' AND avs.Session IN (?)';
      params.push(sessionArray);
    }
    if (minPrice) {
      query += ' AND COALESCE(hr_shift.Rate, hr.Rate) >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND COALESCE(hr_shift.Rate, hr.Rate) <= ?';
      params.push(maxPrice);
    }

    console.log('Received date param:', date);
    console.log('Query:', query);
    console.log('Params:', params);
    const [results] = await pool.execute(query, params);
    console.log('Query results:', results);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// API 2: Lấy availability theo nhiều ngày và giá tiền
app.get('/api/availability-by-session', authenticateToken, async (req, res) => {
  try {
    const { search, date, sessions, minPrice, maxPrice } = req.query;

    let query = `
      SELECT DISTINCT
        h.HelperID,
        h.HelperName,
        h.Phone,
        DATE_FORMAT(a.Date, '%Y-%m-%d') AS Date,
        avs.Session,
        COALESCE(hr_shift.Rate, hr.Rate) AS Rate
      FROM Helper h
      INNER JOIN Availability a ON a.HelperID = h.HelperID
      INNER JOIN Availability_sessions avs ON avs.AvailabilityID = a.AvailabilityID
      INNER JOIN HelperRate hr ON hr.HelperID = h.HelperID
      LEFT JOIN HelperRate hr_shift ON hr_shift.HelperID = h.HelperID
        AND (
          (avs.Session = 'shift 1' AND hr_shift.StartTime = '07:00:00') OR
          (avs.Session = 'shift 2' AND hr_shift.StartTime = '13:00:00') OR
          (avs.Session = 'shift 3' AND hr_shift.StartTime = '18:00:00')
        )
      WHERE a.Status = 'Available'
    `;
    const params = [];

    if (search) {
      query += ' AND h.HelperName LIKE ?';
      params.push(`%${search}%`);
    }
    if (date) {
      query += ' AND DATE(a.Date) = ?';
      params.push(date);
    }
    if (sessions) {
      const sessionArray = sessions.split(',');
      query += ' AND avs.Session IN (?)';
      params.push(sessionArray);
    }
    if (minPrice) {
      query += ' AND COALESCE(hr_shift.Rate, hr.Rate) >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND COALESCE(hr_shift.Rate, hr.Rate) <= ?';
      params.push(maxPrice);
    }

    const [results] = await pool.execute(query, params);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings-by-helper', authenticateToken, async (req, res) => {
  let connection;
  try {
    console.log('Authorization header:', req.headers.authorization);
    console.log('req.auth:', req.user);

    // Lấy helperId từ query parameter
    const helperId = req.user.userId;

    if (!helperId) {
      return res.status(400).json({
        success: false,
        message: 'HelperID is required'
      });
    }

    // Lấy connection từ pool
    connection = await pool.getConnection();

    // Thực hiện query với HelperID, join thêm bảng User để lấy Address
    const [rows] = await connection.execute(`
      SELECT 
        b.BookingID,
        b.UserID,
        b.HelperID,
        b.TotalCost,
        b.Status,
        b.Sessions,
        b.CreatedDate,
        b.IsDeleted,
        b.DateBooking,
        h.HelperName,
        h.Phone,
        u.Address,
        u.AvatarUrl
      FROM Booking b
      LEFT JOIN Helper h ON b.HelperID = h.HelperID
      LEFT JOIN User u ON b.UserID = u.UserID
      WHERE b.HelperID = ?
    `, [helperId]);

    // Trả về kết quả
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu',
      error: error.message
    });
  } finally {
    // Giải phóng connection về pool
    if (connection) connection.release();
  }
});

app.put('/api/bookings/:bookingId/status', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { bookingId } = req.params;
    const helperId = req.user.userId;

    connection = await pool.getConnection();
    const [result] = await connection.execute(`
      UPDATE Booking 
      SET Status = 'completed'
      WHERE BookingID = ? AND HelperID = ?
    `, [bookingId, helperId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated to completed'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật status',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/BookingList', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Truy vấn cơ sở dữ liệu
    const [rows] = await pool.execute(
      `SELECT BookingID, UserID, HelperID, TotalCost, Sessions, IsDeleted, CreatedDate, DateBooking 
       FROM Booking
       WHERE BookingID LIKE ? OR UserID LIKE ? 
       LIMIT ? OFFSET ?`,
      [`%${search || ''}%`, `%${search || ''}%`, parseInt(limit), parseInt(offset)]
    );

    // Đếm tổng số bản ghi
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM Booking WHERE BookingID LIKE ? OR UserID LIKE ?',
      [`%${search || ''}%`, `%${search || ''}%`]
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Trả về dữ liệu đúng định dạng
    res.json({
      bookings: rows, // Danh sách booking
      total: total,   // Tổng số booking
      totalPages: totalPages // Tổng số trang
    });
  } catch (error) {
    console.error('Lỗi khi truy vấn booking:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


////////////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});