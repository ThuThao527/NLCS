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
    origin: 'http://localhost:5175', // Cho phép yêu cầu từ front-end trên cổng 5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Cho phép các phương thức HTTP này
    allowedHeaders: ['Content-Type', 'Authorization'], // Các headers được phép
  })
);

app.use(express.json());

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


// Kết nối MySQL
// const db = await mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: process.env.PASSWORD_MYSQL,
//   database: 'TourManagement',
//   connectTimeout: 10000,
// });

// try {
//   await db.connect();
//   console.log('Connected to MySQL');
// } catch (err) {
//   console.error('Error connecting to MySQL:', err);
//   process.exit(1);
// }

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.PASSWORD_MYSQL,
  database: 'TourManagement',
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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

    const [result] = await db.query(query, updateFields);

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

    const [result] = await db.query(query, updateFields);

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
app.get('/api/helpers', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10, city } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM Helper`;
    let countQuery = `SELECT COUNT(*) as total FROM Helper`;
    const params = [];

    // Lọc theo thành phố nếu có
    if (city) {
      query += ` WHERE Address LIKE ?`;
      countQuery += ` WHERE Address LIKE ?`;
      params.push(`%${city}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Lấy danh sách Helper
    const [helpers] = await db.query(query, params);

    // Lấy tổng số Helper để phân trang
    const [countResult] = await db.query(countQuery, params.slice(0, params.length - 2));
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

// 1. API Tạo HelperRate (Create)
app.post('/api/helper-rates', authenticateToken, async (req, res) => {
  const { HelperID, StartDate, EndDate, StartTime, EndTime, Rate } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!HelperID || !StartDate || !StartTime || !EndTime || !Rate) {
      return res.status(400).json({ message: 'HelperID, StartDate, StartTime, EndTime, and Rate are required' });
    }

    // Kiểm tra xem HelperID có tồn tại không
    const [existingHelper] = await db.query(
      `SELECT * FROM Helper WHERE HelperID = ?`,
      [HelperID]
    );
    if (existingHelper.length === 0) {
      return res.status(400).json({ message: 'Helper not found' });
    }

    // Kiểm tra StartTime < EndTime
    if (StartTime >= EndTime) {
      return res.status(400).json({ message: 'StartTime must be less than EndTime' });
    }

    // Kiểm tra StartDate < EndDate (nếu EndDate không null)
    if (EndDate && StartDate >= EndDate) {
      return res.status(400).json({ message: 'StartDate must be less than EndDate' });
    }

    // Tạo HelperRate mới
    const [result] = await db.query(
      `
      INSERT INTO HelperRate (HelperID, StartDate, EndDate, StartTime, EndTime, Rate)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [HelperID, StartDate, EndDate, StartTime, EndTime, Rate]
    );

    // Lấy thông tin HelperRate vừa tạo
    const [newHelperRate] = await db.query(
      `SELECT * FROM HelperRate WHERE RateID = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'HelperRate created successfully',
      helperRate: newHelperRate[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create helper rate', error: error.message });
  }
});

// 2. API Cập nhật HelperRate (Update)
app.put('/api/helper-rates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { HelperID, StartDate, EndDate, StartTime, EndTime, Rate } = req.body;

  try {
    // Kiểm tra xem HelperRate có tồn tại không
    const [existingHelperRate] = await db.query(
      `SELECT * FROM HelperRate WHERE RateID = ?`,
      [id]
    );
    if (existingHelperRate.length === 0) {
      return res.status(404).json({ message: 'HelperRate not found' });
    }

    // Kiểm tra HelperID nếu có thay đổi
    if (HelperID && HelperID !== existingHelperRate[0].HelperID) {
      const [existingHelper] = await db.query(
        `SELECT * FROM Helper WHERE HelperID = ?`,
        [HelperID]
      );
      if (existingHelper.length === 0) {
        return res.status(400).json({ message: 'Helper not found' });
      }
    }

    // Kiểm tra StartTime < EndTime nếu có thay đổi
    const newStartTime = StartTime || existingHelperRate[0].StartTime;
    const newEndTime = EndTime || existingHelperRate[0].EndTime;
    if (newStartTime >= newEndTime) {
      return res.status(400).json({ message: 'StartTime must be less than EndTime' });
    }

    // Kiểm tra StartDate < EndDate nếu có thay đổi
    const newStartDate = StartDate || existingHelperRate[0].StartDate;
    const newEndDate = EndDate !== undefined ? EndDate : existingHelperRate[0].EndDate;
    if (newEndDate && newStartDate >= newEndDate) {
      return res.status(400).json({ message: 'StartDate must be less than EndDate' });
    }

    // Cập nhật HelperRate
    await db.query(
      `
      UPDATE HelperRate
      SET HelperID = ?, StartDate = ?, EndDate = ?, StartTime = ?, EndTime = ?, Rate = ?
      WHERE RateID = ?
      `,
      [
        HelperID || existingHelperRate[0].HelperID,
        newStartDate,
        newEndDate,
        newStartTime,
        newEndTime,
        Rate || existingHelperRate[0].Rate,
        id,
      ]
    );

    // Lấy thông tin HelperRate sau khi cập nhật
    const [updatedHelperRate] = await db.query(
      `SELECT * FROM HelperRate WHERE RateID = ?`,
      [id]
    );

    res.status(200).json({
      message: 'HelperRate updated successfully',
      helperRate: updatedHelperRate[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update helper rate', error: error.message });
  }
});

// 3. API Xóa HelperRate (Delete)
app.delete('/api/helper-rates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem HelperRate có tồn tại không
    const [existingHelperRate] = await db.query(
      `SELECT * FROM HelperRate WHERE RateID = ?`,
      [id]
    );
    if (existingHelperRate.length === 0) {
      return res.status(404).json({ message: 'HelperRate not found' });
    }

    // Xóa HelperRate
    await db.query(
      `DELETE FROM HelperRate WHERE RateID = ?`,
      [id]
    );

    res.status(200).json({ message: 'HelperRate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete helper rate', error: error.message });
  }
});

// 4. API Lấy thông tin một HelperRate theo ID (Read)
app.get('/api/helper-rates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [helperRate] = await db.query(
      `SELECT * FROM HelperRate WHERE RateID = ?`,
      [id]
    );

    if (helperRate.length === 0) {
      return res.status(404).json({ message: 'HelperRate not found' });
    }

    res.status(200).json({
      message: 'HelperRate retrieved successfully',
      helperRate: helperRate[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve helper rate', error: error.message });
  }
});

// 5. API Lấy danh sách HelperRate (Read, với lọc theo giá và HelperID)
app.get('/api/helper-rates', authenticateToken, async (req, res) => {
  const { helperId, minRate, maxRate, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM HelperRate`;
    let countQuery = `SELECT COUNT(*) as total FROM HelperRate`;
    const params = [];

    // Xây dựng điều kiện lọc
    const conditions = [];
    if (helperId) {
      conditions.push(`HelperID = ?`);
      params.push(helperId);
    }
    if (minRate) {
      conditions.push(`Rate >= ?`);
      params.push(minRate);
    }
    if (maxRate) {
      conditions.push(`Rate <= ?`);
      params.push(maxRate);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Lấy danh sách HelperRate
    const [helperRates] = await db.query(query, params);

    // Lấy tổng số HelperRate để phân trang
    const [countResult] = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = countResult[0].total;

    res.status(200).json({
      message: 'HelperRates retrieved successfully',
      helperRates: helperRates,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve helper rates', error: error.message });
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
    const [rates] = await db.query(
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

// 1. API Tạo Booking (Create)
app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { UserID, HelperID, StartTime, EndTime } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!UserID || !HelperID || !StartTime || !EndTime) {
      return res.status(400).json({ message: 'UserID, HelperID, StartTime, and EndTime are required' });
    }

    // Kiểm tra xem UserID có tồn tại không
    const [existingUser] = await db.query(
      `SELECT * FROM User WHERE UserID = ?`,
      [UserID]
    );
    if (existingUser.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Kiểm tra xem HelperID có tồn tại không
    const [existingHelper] = await db.query(
      `SELECT * FROM Helper WHERE HelperID = ?`,
      [HelperID]
    );
    if (existingHelper.length === 0) {
      return res.status(400).json({ message: 'Helper not found' });
    }

    // Kiểm tra StartTime < EndTime
    if (new Date(StartTime) >= new Date(EndTime)) {
      return res.status(400).json({ message: 'StartTime must be less than EndTime' });
    }

    // Kiểm tra lịch rảnh (Availability)
    const bookingDate = StartTime.split(' ')[0];
    const [availability] = await db.query(
      `
      SELECT *
      FROM Availability
      WHERE HelperID = ?
        AND Date = ?
        AND StartTime <= ?
        AND EndTime >= ?
        AND Status = 'Available'
      `,
      [HelperID, bookingDate, StartTime.split(' ')[1], EndTime.split(' ')[1]]
    );

    if (availability.length === 0) {
      return res.status(400).json({ message: 'The selected time slot is not available' });
    }

    // Tính TotalCost
    const totalCost = await calculateTotalCost(HelperID, StartTime, EndTime);

    // Tạo bản ghi trong Booking
    const [result] = await db.query(
      `
      INSERT INTO Booking (UserID, HelperID, StartTime, EndTime, TotalCost)
      VALUES (?, ?, ?, ?, ?)
      `,
      [UserID, HelperID, StartTime, EndTime, totalCost]
    );

    // Cập nhật trạng thái Availability thành 'Booked'
    await db.query(
      `
      UPDATE Availability
      SET Status = 'Booked'
      WHERE AvailabilityID = ?
      `,
      [availability[0].AvailabilityID]
    );

    // Lấy thông tin Booking vừa tạo
    const [newBooking] = await db.query(
      `SELECT * FROM Booking WHERE BookingID = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
});

// 2. API Cập nhật Booking (Update)
app.put('/api/bookings/update/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { UserID, HelperID, StartTime, EndTime } = req.body;

  try {
    // Kiểm tra xem Booking có tồn tại không
    const [existingBooking] = await db.query(
      `SELECT * FROM Booking WHERE BookingID = ?`,
      [id]
    );
    if (existingBooking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Kiểm tra UserID nếu có thay đổi
    if (UserID && UserID !== existingBooking[0].UserID) {
      const [existingUser] = await db.query(
        `SELECT * FROM User WHERE UserID = ?`,
        [UserID]
      );
      if (existingUser.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }
    }

    // Kiểm tra HelperID nếu có thay đổi
    if (HelperID && HelperID !== existingBooking[0].HelperID) {
      const [existingHelper] = await db.query(
        `SELECT * FROM Helper WHERE HelperID = ?`,
        [HelperID]
      );
      if (existingHelper.length === 0) {
        return res.status(400).json({ message: 'Helper not found' });
      }
    }

    // Kiểm tra StartTime < EndTime nếu có thay đổi
    const newStartTime = StartTime || existingBooking[0].StartTime;
    const newEndTime = EndTime || existingBooking[0].EndTime;
    if (new Date(newStartTime) >= new Date(newEndTime)) {
      return res.status(400).json({ message: 'StartTime must be less than EndTime' });
    }

    // Nếu có thay đổi thời gian hoặc HelperID, kiểm tra lại Availability
    const newHelperID = HelperID || existingBooking[0].HelperID;
    if (StartTime || EndTime || HelperID) {
      const bookingDate = newStartTime.split(' ')[0];
      const [availability] = await db.query(
        `
        SELECT *
        FROM Availability
        WHERE HelperID = ?
          AND Date = ?
          AND StartTime <= ?
          AND EndTime >= ?
          AND Status = 'Available'
        `,
        [newHelperID, bookingDate, newStartTime.split(' ')[1], newEndTime.split(' ')[1]]
      );

      if (availability.length === 0) {
        return res.status(400).json({ message: 'The selected time slot is not available' });
      }

      // Cập nhật trạng thái Availability cũ (nếu cần)
      const [oldAvailability] = await db.query(
        `
        SELECT a.*
        FROM Availability a
        JOIN Booking b ON a.HelperID = b.HelperID
        WHERE b.BookingID = ?
          AND a.Date = ?
          AND a.StartTime <= ?
          AND a.EndTime >= ?
        `,
        [id, existingBooking[0].StartTime.split(' ')[0], existingBooking[0].StartTime.split(' ')[1], existingBooking[0].EndTime.split(' ')[1]]
      );
      if (oldAvailability.length > 0) {
        await db.query(
          `
          UPDATE Availability
          SET Status = 'Available'
          WHERE AvailabilityID = ?
          `,
          [oldAvailability[0].AvailabilityID]
        );
      }

      // Cập nhật trạng thái Availability mới thành 'Booked'
      await db.query(
        `
        UPDATE Availability
        SET Status = 'Booked'
        WHERE AvailabilityID = ?
        `,
        [availability[0].AvailabilityID]
      );
    }

    // Tính lại TotalCost nếu có thay đổi thời gian hoặc HelperID
    let totalCost = existingBooking[0].TotalCost;
    if (StartTime || EndTime || HelperID) {
      totalCost = await calculateTotalCost(newHelperID, newStartTime, newEndTime);
    }

    // Cập nhật Booking
    await db.query(
      `
      UPDATE Booking
      SET UserID = ?, HelperID = ?, StartTime = ?, EndTime = ?, TotalCost = ?
      WHERE BookingID = ?
      `,
      [
        UserID || existingBooking[0].UserID,
        newHelperID,
        newStartTime,
        newEndTime,
        totalCost,
        id,
      ]
    );

    // Lấy thông tin Booking sau khi cập nhật
    const [updatedBooking] = await db.query(
      `SELECT * FROM Booking WHERE BookingID = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Booking updated successfully',
      booking: updatedBooking[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
});

// 3. API Xóa Booking (Delete)
app.delete('/api/bookings/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem Booking có tồn tại không
    const [existingBooking] = await db.query(
      `SELECT * FROM Booking WHERE BookingID = ?`,
      [id]
    );
    if (existingBooking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Cập nhật trạng thái Availability về 'Available'
    const bookingDate = existingBooking[0].StartTime.split(' ')[0];
    const [availability] = await db.query(
      `
      SELECT *
      FROM Availability
      WHERE HelperID = ?
        AND Date = ?
        AND StartTime <= ?
        AND EndTime >= ?
        AND Status = 'Booked'
      `,
      [existingBooking[0].HelperID, bookingDate, existingBooking[0].StartTime.split(' ')[1], existingBooking[0].EndTime.split(' ')[1]]
    );

    if (availability.length > 0) {
      await db.query(
        `
        UPDATE Availability
        SET Status = 'Available'
        WHERE AvailabilityID = ?
        `,
        [availability[0].AvailabilityID]
      );
    }

    // Xóa Booking (các bảng liên quan như Review, WorkHistory sẽ tự động xóa nhờ ON DELETE CASCADE)
    await db.query(
      `DELETE FROM Booking WHERE BookingID = ?`,
      [id]
    );

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete booking', error: error.message });
  }
});

// 4. API Lấy thông tin một Booking theo ID (Read)
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [booking] = await db.query(
      `SELECT * FROM Booking WHERE BookingID = ?`,
      [id]
    );

    if (booking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking retrieved successfully',
      booking: booking[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve booking', error: error.message });
  }
});

// 5. API Lấy danh sách Booking (Read, với lọc theo UserID, HelperID, Status)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  const { userId, helperId, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM Booking`;
    let countQuery = `SELECT COUNT(*) as total FROM Booking`;
    const params = [];

    // Xây dựng điều kiện lọc
    const conditions = [];
    if (userId) {
      conditions.push(`UserID = ?`);
      params.push(userId);
    }
    if (helperId) {
      conditions.push(`HelperID = ?`);
      params.push(helperId);
    }
    if (status) {
      // Giả sử bạn thêm cột Status vào bảng Booking (nếu chưa có)
      // Nếu không có cột Status, bạn có thể bỏ điều kiện này hoặc điều chỉnh logic
      conditions.push(`Status = ?`);
      params.push(status);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Lấy danh sách Booking
    const [bookings] = await db.query(query, params);

    // Lấy tổng số Booking để phân trang
    const [countResult] = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = countResult[0].total;

    res.status(200).json({
      message: 'Bookings retrieved successfully',
      bookings: bookings,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve bookings', error: error.message });
  }
});

// 1. API Tạo Review (Create)
app.post('/api/reviews', authenticateToken, async (req, res) => {
  const { BookingID, ReviewDate, Rating, Comment } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!BookingID || !ReviewDate || !Rating) {
      return res.status(400).json({ message: 'BookingID, ReviewDate, and Rating are required' });
    }

    // Kiểm tra xem BookingID có tồn tại không
    const [existingBooking] = await db.query(
      `SELECT * FROM Booking WHERE BookingID = ?`,
      [BookingID]
    );
    if (existingBooking.length === 0) {
      return res.status(400).json({ message: 'Booking not found' });
    }

    // Kiểm tra Rating trong khoảng 1-5
    if (Rating < 1 || Rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Kiểm tra xem đã có Review cho Booking này chưa
    const [existingReview] = await db.query(
      `SELECT * FROM Review WHERE BookingID = ?`,
      [BookingID]
    );
    if (existingReview.length > 0) {
      return res.status(400).json({ message: 'A review already exists for this booking' });
    }

    // Tạo Review mới
    const [result] = await db.query(
      `
      INSERT INTO Review (BookingID, ReviewDate, Rating, Comment)
      VALUES (?, ?, ?, ?)
      `,
      [BookingID, ReviewDate, Rating, Comment || null]
    );

    // Lấy thông tin Review vừa tạo
    const [newReview] = await db.query(
      `SELECT * FROM Review WHERE ReviewID = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Review created successfully',
      review: newReview[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
});

// 2. API Cập nhật Review (Update)
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { BookingID, ReviewDate, Rating, Comment } = req.body;

  try {
    // Kiểm tra xem Review có tồn tại không
    const [existingReview] = await db.query(
      `SELECT * FROM Review WHERE ReviewID = ?`,
      [id]
    );
    if (existingReview.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Kiểm tra BookingID nếu có thay đổi
    if (BookingID && BookingID !== existingReview[0].BookingID) {
      const [existingBooking] = await db.query(
        `SELECT * FROM Booking WHERE BookingID = ?`,
        [BookingID]
      );
      if (existingBooking.length === 0) {
        return res.status(400).json({ message: 'Booking not found' });
      }

      // Kiểm tra xem BookingID mới đã có Review chưa
      const [existingReviewForBooking] = await db.query(
        `SELECT * FROM Review WHERE BookingID = ? AND ReviewID != ?`,
        [BookingID, id]
      );
      if (existingReviewForBooking.length > 0) {
        return res.status(400).json({ message: 'A review already exists for this booking' });
      }
    }

    // Kiểm tra Rating nếu có thay đổi
    const newRating = Rating !== undefined ? Rating : existingReview[0].Rating;
    if (newRating < 1 || newRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Cập nhật Review
    await db.query(
      `
      UPDATE Review
      SET BookingID = ?, ReviewDate = ?, Rating = ?, Comment = ?
      WHERE ReviewID = ?
      `,
      [
        BookingID || existingReview[0].BookingID,
        ReviewDate || existingReview[0].ReviewDate,
        newRating,
        Comment !== undefined ? Comment : existingReview[0].Comment,
        id,
      ]
    );

    // Lấy thông tin Review sau khi cập nhật
    const [updatedReview] = await db.query(
      `SELECT * FROM Review WHERE ReviewID = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Review updated successfully',
      review: updatedReview[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
});

// 3. API Xóa Review (Delete)
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem Review có tồn tại không
    const [existingReview] = await db.query(
      `SELECT * FROM Review WHERE ReviewID = ?`,
      [id]
    );
    if (existingReview.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Xóa Review
    await db.query(
      `DELETE FROM Review WHERE ReviewID = ?`,
      [id]
    );

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
});

// 4. API Lấy thông tin một Review theo ID (Read)
app.get('/api/reviews/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [review] = await db.query(
      `SELECT * FROM Review WHERE ReviewID = ?`,
      [id]
    );

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({
      message: 'Review retrieved successfully',
      review: review[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve review', error: error.message });
  }
});

// 5. API Lấy danh sách Review (Read, với lọc theo HelperID và BookingID)
app.get('/api/reviews', authenticateToken, async (req, res) => {
  const { helperId, bookingId, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT r.*, b.HelperID
      FROM Review r
      JOIN Booking b ON r.BookingID = b.BookingID
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM Review r
      JOIN Booking b ON r.BookingID = b.BookingID
    `;
    const params = [];

    // Xây dựng điều kiện lọc
    const conditions = [];
    if (helperId) {
      conditions.push(`b.HelperID = ?`);
      params.push(helperId);
    }
    if (bookingId) {
      conditions.push(`r.BookingID = ?`);
      params.push(bookingId);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Lấy danh sách Review
    const [reviews] = await db.query(query, params);

    // Lấy tổng số Review để phân trang
    const [countResult] = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = countResult[0].total;

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      reviews: reviews,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve reviews', error: error.message });
  }
});


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

// 1. API Tạo WorkHistory (Create)
app.post('/api/work-histories', authenticateToken, async (req, res) => {
  const { BookingID } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!BookingID) {
      return res.status(400).json({ message: 'BookingID is required' });
    }

    // Kiểm tra xem BookingID có tồn tại không
    const [existingBooking] = await db.query(
      `SELECT * FROM Booking WHERE BookingID = ?`,
      [BookingID]
    );
    if (existingBooking.length === 0) {
      return res.status(400).json({ message: 'Booking not found' });
    }

    // Kiểm tra xem đã có WorkHistory cho Booking này chưa
    const [existingWorkHistory] = await db.query(
      `SELECT * FROM WorkHistory WHERE BookingID = ?`,
      [BookingID]
    );
    if (existingWorkHistory.length > 0) {
      return res.status(400).json({ message: 'A work history already exists for this booking' });
    }

    // Tính Total_Hours
    const totalHours = await calculateTotalHours(BookingID);

    // Tính Average_star (nếu có Review)
    const averageStar = await calculateAverageStar(BookingID);

    // Tạo WorkHistory mới
    const [result] = await db.query(
      `
      INSERT INTO WorkHistory (BookingID, Total_Hours, Average_star)
      VALUES (?, ?, ?)
      `,
      [BookingID, totalHours, averageStar]
    );

    // Lấy thông tin WorkHistory vừa tạo
    const [newWorkHistory] = await db.query(
      `SELECT * FROM WorkHistory WHERE WorkHistoryID = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'WorkHistory created successfully',
      workHistory: newWorkHistory[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create work history', error: error.message });
  }
});

// 2. API Cập nhật WorkHistory (Update)
app.put('/api/work-histories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { BookingID, Total_Hours, Average_star } = req.body;

  try {
    // Kiểm tra xem WorkHistory có tồn tại không
    const [existingWorkHistory] = await db.query(
      `SELECT * FROM WorkHistory WHERE WorkHistoryID = ?`,
      [id]
    );
    if (existingWorkHistory.length === 0) {
      return res.status(404).json({ message: 'WorkHistory not found' });
    }

    // Kiểm tra BookingID nếu có thay đổi
    if (BookingID && BookingID !== existingWorkHistory[0].BookingID) {
      const [existingBooking] = await db.query(
        `SELECT * FROM Booking WHERE BookingID = ?`,
        [BookingID]
      );
      if (existingBooking.length === 0) {
        return res.status(400).json({ message: 'Booking not found' });
      }

      // Kiểm tra xem BookingID mới đã có WorkHistory chưa
      const [existingWorkHistoryForBooking] = await db.query(
        `SELECT * FROM WorkHistory WHERE BookingID = ? AND WorkHistoryID != ?`,
        [BookingID, id]
      );
      if (existingWorkHistoryForBooking.length > 0) {
        return res.status(400).json({ message: 'A work history already exists for this booking' });
      }
    }

    // Tính lại Total_Hours nếu có thay đổi BookingID
    let newTotalHours = Total_Hours !== undefined ? Total_Hours : existingWorkHistory[0].Total_Hours;
    if (BookingID && BookingID !== existingWorkHistory[0].BookingID) {
      newTotalHours = await calculateTotalHours(BookingID);
    }

    // Tính lại Average_star nếu có thay đổi BookingID
    let newAverageStar = Average_star !== undefined ? Average_star : existingWorkHistory[0].Average_star;
    if (BookingID && BookingID !== existingWorkHistory[0].BookingID) {
      newAverageStar = await calculateAverageStar(BookingID);
    }

    // Kiểm tra Average_star (nếu có giá trị)
    if (newAverageStar !== null && (newAverageStar < 1 || newAverageStar > 5)) {
      return res.status(400).json({ message: 'Average_star must be between 1 and 5' });
    }

    // Cập nhật WorkHistory
    await db.query(
      `
      UPDATE WorkHistory
      SET BookingID = ?, Total_Hours = ?, Average_star = ?
      WHERE WorkHistoryID = ?
      `,
      [
        BookingID || existingWorkHistory[0].BookingID,
        newTotalHours,
        newAverageStar,
        id,
      ]
    );

    // Lấy thông tin WorkHistory sau khi cập nhật
    const [updatedWorkHistory] = await db.query(
      `SELECT * FROM WorkHistory WHERE WorkHistoryID = ?`,
      [id]
    );

    res.status(200).json({
      message: 'WorkHistory updated successfully',
      workHistory: updatedWorkHistory[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update work history', error: error.message });
  }
});

// 3. API Xóa WorkHistory (Delete)
app.delete('/api/work-histories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem WorkHistory có tồn tại không
    const [existingWorkHistory] = await db.query(
      `SELECT * FROM WorkHistory WHERE WorkHistoryID = ?`,
      [id]
    );
    if (existingWorkHistory.length === 0) {
      return res.status(404).json({ message: 'WorkHistory not found' });
    }

    // Xóa WorkHistory
    await db.query(
      `DELETE FROM WorkHistory WHERE WorkHistoryID = ?`,
      [id]
    );

    res.status(200).json({ message: 'WorkHistory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete work history', error: error.message });
  }
});

// 4. API Lấy thông tin một WorkHistory theo ID (Read)
app.get('/api/work-histories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [workHistory] = await db.query(
      `SELECT * FROM WorkHistory WHERE WorkHistoryID = ?`,
      [id]
    );

    if (workHistory.length === 0) {
      return res.status(404).json({ message: 'WorkHistory not found' });
    }

    res.status(200).json({
      message: 'WorkHistory retrieved successfully',
      workHistory: workHistory[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve work history', error: error.message });
  }
});

// 5. API Lấy danh sách WorkHistory (Read, với lọc theo HelperID và BookingID)
app.get('/api/work-histories', authenticateToken, async (req, res) => {
  const { helperId, bookingId, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT wh.*, b.HelperID
      FROM WorkHistory wh
      JOIN Booking b ON wh.BookingID = b.BookingID
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM WorkHistory wh
      JOIN Booking b ON wh.BookingID = b.BookingID
    `;
    const params = [];

    // Xây dựng điều kiện lọc
    const conditions = [];
    if (helperId) {
      conditions.push(`b.HelperID = ?`);
      params.push(helperId);
    }
    if (bookingId) {
      conditions.push(`wh.BookingID = ?`);
      params.push(bookingId);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Lấy danh sách WorkHistory
    const [workHistories] = await db.query(query, params);

    // Lấy tổng số WorkHistory để phân trang
    const [countResult] = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = countResult[0].total;

    res.status(200).json({
      message: 'WorkHistories retrieved successfully',
      workHistories: workHistories,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve work histories', error: error.message });
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

  try {
    const [countResults] = await db.query(countQuery);
    const totalPosts = countResults[0].total;
    const totalPages = Math.ceil(totalPosts / limit);

    const [results] = await db.query(query, [limit, offset]);

    res.json({
      posts: results,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPosts: totalPosts,
        postsPerPage: limit
      }
    });
  } catch (error) {
    console.log('Error retrieving blog posts:', error);
    res.status(500).json({ message: 'Error retrieving blog posts', error: error.message });
  }
});

// API lấy chi tiết một blog theo ID
app.get('/api/posts/:id', async (req, res) => {
  const blogId = req.params.id;
  const query = `
    SELECT blog.*, categories.Name
    FROM blog
    INNER JOIN categories ON blog.CategoryID = categories.CategoryID
    WHERE blog.BlogID = ?
  `;

  try {
    const [results] = await db.query(query, [blogId]);
    if (results.length === 0) {
      console.log('Blog not found');
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.log('Error retrieving blog post:', error);
    res.status(500).json({ message: 'Error retrieving blog post', error: error.message });
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
const createUser = (db, userData, callback) => {
  const { Email, FullName, PhoneNumber, Address, Password, Role, AvatarUrl } = userData;

  // Băm mật khẩu
  hashPassword(Password.trim())
    .then((hashedPassword) => {
      db.query(
        `
        INSERT INTO User (Email, Password, FullName, PhoneNumber, Address, AvatarUrl, Role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [Email, hashedPassword, FullName, PhoneNumber, Address, AvatarUrl || null, Role],
        (err, result) => {
          if (err) {
            return callback(err);
          }

          db.query(
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
const createHelper = (db, helperData, callback) => {
  const { Email, HelperName, Phone, Address, Password, IMG_Helper } = helperData;

  // Băm mật khẩu
  hashPassword(Password.trim())
    .then((hashedPassword) => {
      db.query(
        `
        INSERT INTO Helper (Email, Password, HelperName, Phone, Address, IMG_Helper)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [Email, hashedPassword, HelperName, Phone, Address, IMG_Helper || null],
        (err, result) => {
          if (err) {
            return callback(err);
          }

          db.query(
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
    const [existingUser] = await db.query(`SELECT * FROM User WHERE Email = ?`, [Email]);
    console.log('Existing user result:', existingUser);

    // Kiểm tra email trùng lặp trong bảng Helper
    console.log('Checking email in Helper table...');
    const [existingHelper] = await db.query(`SELECT * FROM Helper WHERE Email = ?`, [Email]);
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
      const [result] = await db.query(
        `
        INSERT INTO Helper (Email, Password, HelperName, Phone, Address, IMG_Helper)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [Email, hashedPassword, FullName, PhoneNumber, Address, AvatarUrl || null]
      );

      const [newHelper] = await db.query(
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
      const [result] = await db.query(
        `
        INSERT INTO User (Email, Password, FullName, PhoneNumber, Address, AvatarUrl, Role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [Email, hashedPassword, FullName, PhoneNumber, Address, AvatarUrl || null, Role]
      );

      const [newUser] = await db.query(
        `SELECT UserID, Email, FullName, PhoneNumber, Address, AvatarUrl, Role FROM User WHERE UserID = ?`,
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
    const [results] = await db.query('SELECT * FROM user WHERE email = ?', [Email]);

    if (results.length > 0) {
      res.status(200).json({ message: 'Đăng nhập thành công!', user: results[0] });
    } else {
      const [result] = await db.query(
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

    const [userResults] = await db.query(`SELECT * FROM User WHERE Email = ?`, [Email]);

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
      const [helperResults] = await db.query(`SELECT * FROM Helper WHERE Email = ?`, [Email]);
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
    db.query(
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



////////////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});