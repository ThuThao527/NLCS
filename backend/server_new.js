import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import axios from 'axios';
import util from 'util';
import { constrainedMemory } from 'process';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' })); // Tăng giới hạn payload JSON
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cấu hình CORS và Express
app.use(cors());

app.use(
  cors({
    origin: 'http://localhost:5173', // Cho phép yêu cầu từ front-end trên cổng 5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Cho phép các phương thức HTTP này
    allowedHeaders: ['Content-Type'], // Các headers được phép
  })
);

app.use(express.json());

// Cấu hình Multer để lưu file vào thư mục uploads
const storage = multer.diskStorage({
  destination: 'uploads/', // Thư mục lưu ảnh
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file theo timestamp
  },
});

const upload = multer({ storage });

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.PASSWORD_MYSQL, // Thay bằng mật khẩu của bạn
  database: 'TourManagement', // Tên database
  connectTimeout: 10000,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  } else {
    console.log('Connected to MySQL');
  }
});
////////////////////////////////////////////////////////////////////////////////

// 2. API Cập nhật Helper (Update)
app.put('/api/helpers/:id', async (req, res) => {
  const { id } = req.params;
  const { HelperName, Phone, Address, IMG_Helper, Email, Password } = req.body;

  try {
    // Kiểm tra xem Helper có tồn tại không
    const [existingHelper] = await db.query(
      `SELECT * FROM Helper WHERE HelperID = ?`,
      [id]
    );
    if (existingHelper.length === 0) {
      return res.status(404).json({ message: 'Helper not found' });
    }

    // Kiểm tra email nếu có thay đổi
    if (Email && Email !== existingHelper[0].Email) {
      const [emailCheck] = await db.query(
        `SELECT * FROM Helper WHERE Email = ? AND HelperID != ?`,
        [Email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Nếu có mật khẩu mới, mã hóa mật khẩu
    let hashedPassword = existingHelper[0].Password;
    if (Password) {
      hashedPassword = await hashPassword(Password);
    }

    // Cập nhật thông tin Helper
    await db.query(
      `
      UPDATE Helper
      SET HelperName = ?, Phone = ?, Address = ?, IMG_Helper = ?, Email = ?, Password = ?
      WHERE HelperID = ?
      `,
      [
        HelperName || existingHelper[0].HelperName,
        Phone || existingHelper[0].Phone,
        Address || existingHelper[0].Address,
        IMG_Helper || existingHelper[0].IMG_Helper,
        Email || existingHelper[0].Email,
        hashedPassword,
        id,
      ]
    );

    // Lấy thông tin Helper sau khi cập nhật
    const [updatedHelper] = await db.query(
      `SELECT * FROM Helper WHERE HelperID = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Helper updated successfully',
      helper: updatedHelper[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update helper', error: error.message });
  }
});

// 3. API Xóa Helper (Delete)
app.delete('/api/helpers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem Helper có tồn tại không
    const [existingHelper] = await db.query(
      `SELECT * FROM Helper WHERE HelperID = ?`,
      [id]
    );
    if (existingHelper.length === 0) {
      return res.status(404).json({ message: 'Helper not found' });
    }

    // Xóa Helper (các bảng liên quan như HelperRate, Availability, Booking sẽ tự động xóa nhờ ON DELETE CASCADE)
    await db.query(
      `DELETE FROM Helper WHERE HelperID = ?`,
      [id]
    );

    res.status(200).json({ message: 'Helper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete helper', error: error.message });
  }
});

// 4. API Lấy thông tin một Helper theo ID (Read)
app.get('/api/helpers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [helper] = await db.query(
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
app.get('/api/helpers', async (req, res) => {
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
app.post('/api/helper-rates', async (req, res) => {
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
app.put('/api/helper-rates/:id', async (req, res) => {
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
app.delete('/api/helper-rates/:id', async (req, res) => {
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
app.get('/api/helper-rates/:id', async (req, res) => {
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
app.get('/api/helper-rates', async (req, res) => {
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


// 1. API Tạo Availability (Create)
app.post('/api/availabilities', async (req, res) => {
  const { HelperID, Date, StartTime, EndTime, Status } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!HelperID || !Date || !StartTime || !EndTime) {
      return res.status(400).json({ message: 'HelperID, Date, StartTime, and EndTime are required' });
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

    // Kiểm tra xem khung giờ có bị trùng không
    const [overlappingAvailability] = await db.query(
      `
      SELECT * FROM Availability
      WHERE HelperID = ? AND Date = ?
        AND (
          (StartTime <= ? AND EndTime > ?) OR
          (StartTime < ? AND EndTime >= ?) OR
          (StartTime >= ? AND EndTime <= ?)
        )
      `,
      [HelperID, Date, StartTime, StartTime, EndTime, EndTime, StartTime, EndTime]
    );
    if (overlappingAvailability.length > 0) {
      return res.status(400).json({ message: 'The time slot overlaps with an existing availability' });
    }

    // Tạo Availability mới
    const [result] = await db.query(
      `
      INSERT INTO Availability (HelperID, Date, StartTime, EndTime, Status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [HelperID, Date, StartTime, EndTime, Status || 'Available']
    );

    // Lấy thông tin Availability vừa tạo
    const [newAvailability] = await db.query(
      `SELECT * FROM Availability WHERE AvailabilityID = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Availability created successfully',
      availability: newAvailability[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create availability', error: error.message });
  }
});

// 2. API Cập nhật Availability (Update)
app.put('/api/availabilities/:id', async (req, res) => {
  const { id } = req.params;
  const { HelperID, Date, StartTime, EndTime, Status } = req.body;

  try {
    // Kiểm tra xem Availability có tồn tại không
    const [existingAvailability] = await db.query(
      `SELECT * FROM Availability WHERE AvailabilityID = ?`,
      [id]
    );
    if (existingAvailability.length === 0) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    // Kiểm tra HelperID nếu có thay đổi
    if (HelperID && HelperID !== existingAvailability[0].HelperID) {
      const [existingHelper] = await db.query(
        `SELECT * FROM Helper WHERE HelperID = ?`,
        [HelperID]
      );
      if (existingHelper.length === 0) {
        return res.status(400).json({ message: 'Helper not found' });
      }
    }

    // Kiểm tra StartTime < EndTime nếu có thay đổi
    const newStartTime = StartTime || existingAvailability[0].StartTime;
    const newEndTime = EndTime || existingAvailability[0].EndTime;
    if (newStartTime >= newEndTime) {
      return res.status(400).json({ message: 'StartTime must be less than EndTime' });
    }

    // Kiểm tra khung giờ trùng nếu có thay đổi thời gian
    const newDate = Date || existingAvailability[0].Date;
    const newHelperID = HelperID || existingAvailability[0].HelperID;
    if (StartTime || EndTime || Date || HelperID) {
      const [overlappingAvailability] = await db.query(
        `
        SELECT * FROM Availability
        WHERE HelperID = ? AND Date = ?
          AND (
            (StartTime <= ? AND EndTime > ?) OR
            (StartTime < ? AND EndTime >= ?) OR
            (StartTime >= ? AND EndTime <= ?)
          )
          AND AvailabilityID != ?
        `,
        [newHelperID, newDate, newStartTime, newStartTime, newEndTime, newEndTime, newStartTime, newEndTime, id]
      );
      if (overlappingAvailability.length > 0) {
        return res.status(400).json({ message: 'The time slot overlaps with an existing availability' });
      }
    }

    // Cập nhật Availability
    await db.query(
      `
      UPDATE Availability
      SET HelperID = ?, Date = ?, StartTime = ?, EndTime = ?, Status = ?
      WHERE AvailabilityID = ?
      `,
      [
        newHelperID,
        newDate,
        newStartTime,
        newEndTime,
        Status || existingAvailability[0].Status,
        id,
      ]
    );

    // Lấy thông tin Availability sau khi cập nhật
    const [updatedAvailability] = await db.query(
      `SELECT * FROM Availability WHERE AvailabilityID = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Availability updated successfully',
      availability: updatedAvailability[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update availability', error: error.message });
  }
});

// 3. API Xóa Availability (Delete)
app.delete('/api/availabilities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem Availability có tồn tại không
    const [existingAvailability] = await db.query(
      `SELECT * FROM Availability WHERE AvailabilityID = ?`,
      [id]
    );
    if (existingAvailability.length === 0) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    // Xóa Availability
    await db.query(
      `DELETE FROM Availability WHERE AvailabilityID = ?`,
      [id]
    );

    res.status(200).json({ message: 'Availability deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete availability', error: error.message });
  }
});

// 4. API Lấy thông tin một Availability theo ID (Read)
app.get('/api/availabilities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [availability] = await db.query(
      `SELECT * FROM Availability WHERE AvailabilityID = ?`,
      [id]
    );

    if (availability.length === 0) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    res.status(200).json({
      message: 'Availability retrieved successfully',
      availability: availability[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve availability', error: error.message });
  }
});

// 5. API Lấy danh sách Availability (Read, với lọc theo Status, giá, ngày, ngày giờ, HelperID)
app.get('/api/availabilities', async (req, res) => {
  const { minPrice, maxPrice, date, helperId, session, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT a.*, h.FullName AS HelperName
      FROM Availability a
      JOIN Helper h ON a.HelperID = h.HelperID
      WHERE a.Status = 'Available'
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM Availability a
      JOIN Helper h ON a.HelperID = h.HelperID
      WHERE a.Status = 'Available'
    `;
    const params = [];

    const conditions = [];
    if (date) {
      conditions.push(`a.Date = ?`);
      params.push(date);
    }
    if (helperId) {
      conditions.push(`a.HelperID = ?`);
      params.push(helperId);
    }
    if (session) {
      if (session === 'session1') {
        conditions.push(`a.StartTime = '07:00:00' AND a.EndTime = '12:00:00'`);
      } else if (session === 'session2') {
        conditions.push(`a.StartTime = '13:00:00' AND a.EndTime = '17:00:00'`);
      } else if (session === 'fullDay') {
        conditions.push(`a.StartTime = '07:00:00' AND a.EndTime = '17:00:00'`);
      }
    }

    if (conditions.length > 0) {
      const whereClause = ` AND ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    const [availabilities] = await db.query(query, params);

    const availabilitiesWithPrice = await Promise.all(
      availabilities.map(async (availability) => {
        const price = await calculateTotalCost(
          availability.HelperID,
          `${availability.Date} ${availability.StartTime}`,
          `${availability.Date} ${availability.EndTime}`
        );
        return { ...availability, Price: price };
      })
    );

    let filteredAvailabilities = availabilitiesWithPrice;
    if (minPrice || maxPrice) {
      filteredAvailabilities = availabilitiesWithPrice.filter((availability) => {
        const price = availability.Price;
        const min = minPrice ? parseFloat(minPrice) : -Infinity;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    const paginatedAvailabilities = filteredAvailabilities.slice(offset, offset + parseInt(limit));
    const total = filteredAvailabilities.length;

    res.status(200).json({
      message: 'Availabilities retrieved successfully',
      availabilities: paginatedAvailabilities,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve availabilities', error: error.message });
  }
});

app.get('/api/helpers/search', async (req, res) => {
  const { name, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT h.*, 
             COALESCE(AVG(r.Rating), 0) AS AverageRating
      FROM Helper h
      LEFT JOIN Review r ON h.HelperID = r.HelperID
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM Helper h
    `;
    const params = [];

    if (name) {
      query += ` WHERE h.FullName LIKE ?`;
      countQuery += ` WHERE h.FullName LIKE ?`;
      params.push(`%${name}%`);
    }

    query += ` GROUP BY h.HelperID LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [helpers] = await db.query(query, params);
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
app.post('/api/bookings', async (req, res) => {
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
app.put('/api/bookings/:id', async (req, res) => {
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
app.delete('/api/bookings/:id', async (req, res) => {
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
app.get('/api/bookings/:id', async (req, res) => {
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
app.get('/api/bookings', async (req, res) => {
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
app.post('/api/reviews', async (req, res) => {
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
app.put('/api/reviews/:id', async (req, res) => {
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
app.delete('/api/reviews/:id', async (req, res) => {
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
app.get('/api/reviews/:id', async (req, res) => {
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
app.get('/api/reviews', async (req, res) => {
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
async function calculateTotalHours(bookingId) {
  try {
    const [booking] = await db.query(
      `SELECT StartTime, EndTime FROM Booking WHERE BookingID = ?`,
      [bookingId]
    );
    if (booking.length === 0) {
      throw new Error('Booking not found');
    }

    const start = new Date(booking[0].StartTime);
    const end = new Date(booking[0].EndTime);
    const hours = (end - start) / (1000 * 60 * 60); // Chuyển thành giờ
    return parseFloat(hours.toFixed(2));
  } catch (error) {
    throw new Error(`Error calculating total hours: ${error.message}`);
  }
}

// Hàm tính Average_star từ Review
async function calculateAverageStar(bookingId) {
  try {
    const [review] = await db.query(
      `SELECT Rating FROM Review WHERE BookingID = ?`,
      [bookingId]
    );
    if (review.length === 0) {
      return null; // Nếu không có Review, trả về null
    }
    return parseFloat(review[0].Rating.toFixed(1));
  } catch (error) {
    throw new Error(`Error calculating average star: ${error.message}`);
  }
}

// 1. API Tạo WorkHistory (Create)
app.post('/api/work-histories', async (req, res) => {
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
app.put('/api/work-histories/:id', async (req, res) => {
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
app.delete('/api/work-histories/:id', async (req, res) => {
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
app.get('/api/work-histories/:id', async (req, res) => {
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
app.get('/api/work-histories', async (req, res) => {
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

// API tìm bài viết mới nhất
app.get('/api/posts/related', (req, res) => {
  const query = `
   SELECT 
    Posts.PostID, 
    Posts.CreatedAt, 
    Posts.Views, 
    User.FullName AS Author, 
    User.AvatarUrl AS AuthorAvatar, 
    Categories.Name AS Category,
    PostContent.Title, 
    PostContent.Subtitle, 
    PostContent.ContentIntro, 
    PostContent.Quote, 
    PostContent.ContentBody, 
    PostContent.ImageUrl
FROM Posts
INNER JOIN User ON Posts.AuthorID = User.UserID
INNER JOIN Categories ON Posts.CategoryID = Categories.CategoryID
INNER JOIN PostContent ON Posts.PostID = PostContent.PostID
WHERE Categories.Name = 'blog'
ORDER BY Posts.CreatedAt DESC
LIMIT 3
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching related posts:', err);
      res.status(500).json({ message: 'Error fetching related posts' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/posts', (req, res) => {
  const category_name = req.query.category_name; // Lấy category_id từ tham số query
  // Xây dựng phần WHERE trong câu truy vấn
  let query = `
  SELECT 
      Posts.PostID, 
      Posts.CreatedAt, 
      Posts.Views, 
      User.FullName AS Author, 
      User.AvatarUrl AS AuthorAvatar, 
      Categories.Name AS Category,
      PostContent.Title, 
      PostContent.Subtitle, 
      PostContent.ContentIntro, 
      PostContent.Quote, 
      PostContent.ContentBody, 
      PostContent.Link, 
      PostContent.ImageUrl, 
      PostContent.ContentID AS PostContentID
  FROM Posts
  INNER JOIN User ON Posts.AuthorID = User.UserID
  INNER JOIN Categories ON Posts.CategoryID = Categories.CategoryID
  INNER JOIN PostContent ON Posts.PostID = PostContent.PostID
`;

  // Nếu có category_name, thêm điều kiện WHERE vào câu truy vấn
  if (category_name) {
    query += ` WHERE Categories.Name = ?`;
  } else {
    query += ` WHERE Categories.Name = 'blog'`;
  }

  query += ` ORDER BY Posts.CreatedAt DESC;`; // Sắp xếp theo thời gian tạo mới nhất

  // Thực thi truy vấn
  db.query(query, [category_name], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving posts' });
    } else {
      res.json(results);
    }
  });
});

// API để xóa bài đăng và nội dung bài đăng
app.delete('/api/posts/:postId/contents/:postContentId', (req, res) => {
  const { postId, postContentId } = req.params;

  // Kiểm tra sự tồn tại của bài đăng và nội dung bài đăng
  const checkQuery = `
    SELECT * FROM posts 
    INNER JOIN PostContent ON posts.PostID = PostContent.PostID
    WHERE posts.PostID = ? AND PostContent.PostID = ?
  `;

  db.query(checkQuery, [postId, postContentId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error checking post and content',
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Post or content not found' });
    }

    // Xóa nội dung bài đăng
    const deleteContentQuery = 'DELETE FROM PostContent WHERE ContentID = ?';
    db.query(deleteContentQuery, [postContentId], (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Error deleting post content', error: err.message });
      }

      // Xóa bài đăng nếu không còn nội dung nào liên kết
      const checkRemainingContentsQuery =
        'SELECT * FROM PostContent WHERE PostID = ?';
      db.query(
        checkRemainingContentsQuery,
        [postId],
        (err, remainingContents) => {
          if (err) {
            return res.status(500).json({
              message: 'Error checking remaining content',
              error: err.message,
            });
          }

          if (remainingContents.length === 0) {
            const deletePostQuery = 'DELETE FROM posts WHERE PostID = ?';
            db.query(deletePostQuery, [postId], (err) => {
              if (err) {
                return res
                  .status(500)
                  .json({ message: 'Error deleting post', error: err.message });
              }

              return res
                .status(200)
                .json({ message: 'Post and content deleted successfully' });
            });
          } else {
            return res.status(200).json({
              message: 'Content deleted successfully, post still exists',
            });
          }
        }
      );
    });
  });
});

// API lấy chi tiết bài viết theo ID (posts và post_content)
app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  const query = `
    SELECT *
    FROM posts
    INNER JOIN user ON posts.AuthorID = user.UserID
    INNER JOIN categories ON posts.CategoryID = categories.CategoryID
    INNER JOIN PostContent ON posts.PostID = PostContent.PostID
    WHERE posts.PostID = ?`;
  db.query(query, [postId], (err, results) => {
    if (err) {
      console.log('Error retrieving blog post');
      res.status(500).json({ message: 'Error retrieving blog post' });
    } else if (results.length === 0) {
      console.log('Post not found');
      res.status(404).json({ message: 'Post not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// API đăng bài viết mới (posts và post_content)
app.post('/api/posts', (req, res) => {
  const {
    AuthorID,
    CategoryID,
    ImageUrl,
    Title,
    Subtitle,
    ContentIntro,
    Quote,
    ContentBody,
    Link,
  } = req.body;
  console.log(req.body);

  // Thêm vào bảng posts
  const insertPostQuery = `
    INSERT INTO posts (AuthorID, CategoryID)
    VALUES (?, ?)
  `;

  db.query(insertPostQuery, [AuthorID, CategoryID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating post' });
    }

    const postId = result.insertId;

    // Thêm chi tiết bài viết vào bảng post_content
    const insertContentQuery = `
      INSERT INTO PostContent (PostID, Title, Subtitle, ContentIntro, Quote, ContentBody, ImageUrl, Link)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

    `;

    db.query(
      insertContentQuery,
      [
        postId,
        Title,
        Subtitle,
        ContentIntro,
        Quote,
        ContentBody,
        ImageUrl,
        Link,
      ],
      (err, result) => {
        if (err) {
          res.status(500).json({ message: 'Error creating post content' });
        } else {
          res.status(200).json({
            Title,
            image: ImageUrl,
            message: 'Post created successfully',
            postId: postId,
          });
        }
      }
    );
  });
});

// API lấy danh sách danh mục
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM categories';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.status(200).json(results);
    }
  });
});

// API lấy danh sách admin
app.get('/api/users/admin', (req, res) => {
  const query = `SELECT * from User join role on User.UserID = role.UserID`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.json(results);
    }
  });
});

// API thêm danh mục mới
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  const query = `
    INSERT INTO categories (Name)
    VALUES (?)
  `;
  db.query(query, [name], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Error creating category' });
    } else {
      res.status(200).json({
        message: 'Category created successfully',
        categoryId: result.insertId,
      });
    }
  });
});

// API lấy danh sách bình luận cho bài viết
app.get('/api/posts/:postId/comments', (req, res) => {
  const { postId } = req.params;
  const query = `
    SELECT 
      *
    FROM comments
    JOIN user ON comments.AuthorID = user.UserID
    WHERE comments.PostID = ?
  `;
  db.query(query, [postId], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving comments' });
    } else {
      res.json(results);
    }
  });
});

// API thêm bình luận cho bài viết
app.post('/api/posts/:postId/comments', (req, res) => {
  const { postId } = req.params;
  const { author_id, content, email } = req.body;
  console.log(req.body);

  // Tiến hành chèn bình luận vào bảng comments
  const insertCommentQuery =
    'INSERT INTO comments (PostID, AuthorID, Content) VALUES (?, ?, ?)';

  console.log(postId, author_id, content);
  db.query(insertCommentQuery, [postId, author_id, content], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating comment' });
    }

    res.status(200).json({
      message: 'Comment created successfully',
      commentId: result.insertId,
    });
  });
});

//API xóa comment
app.delete('/api/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  const { author_id } = req.body; // Lấy `author_id` từ body của request

  // Truy vấn để xóa bình luận dựa trên `author_id`, `post_id` và `id`
  const deleteCommentQuery =
    'DELETE FROM comments WHERE CommentID = ? AND PostID = ? AND AuthorID = ?';

  db.query(
    deleteCommentQuery,
    [commentId, postId, author_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting comment' });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: 'Comment not found or unauthorized' });
      }

      res.status(200).json({ message: 'Comment deleted successfully' });
    }
  );
});

// API đếm số comment của bài viết
app.get('/api/comments/:postId', (req, res) => {
  const postId = req.params.postId;

  if (postId == undefined) {
    return res.status(400).json({ message: 'PostId is required' });
  }

  const query = `SELECT COUNT(*) as count FROM comments Where PostID = ?`;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Error checking like status' });
    }

    if (results) {
      return res.status(200).json(results[0].count);
    }
  });
});

// API tăng/giảm lượt thích
app.post('/api/posts/:id/like', (req, res) => {
  const postId = req.params.id; // ID bài viết
  const { userId, action } = req.body; // ID người dùng và hành động ('like' hoặc 'unlike')

  if (!['like', 'unlike'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  // Thực hiện thêm hoặc xóa bản ghi trong bảng user_likes
  if (action === 'like') {
    const addLikeQuery = `
        INSERT INTO UserLikes (UserID, PostID)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE LikeID=LikeID; -- Đảm bảo không thêm trùng lặp
      `;
    db.query(addLikeQuery, [userId, postId], (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Error adding to user_likes' });
      }
      return res.status(200).json({ message: 'Post liked successfully' });
    });
  } else if (action === 'unlike') {
    const removeLikeQuery = `
        DELETE FROM UserLikes
        WHERE UserID = ? AND PostID = ?
      `;
    db.query(removeLikeQuery, [userId, postId], (err) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: 'Error removing from user_likes' });
      }
      return res.status(200).json({ message: 'Post unliked successfully' });
    });
  }
});

//API đếm số lượt like của bài viết
app.get('/api/user_likes/:postId', (req, res) => {
  const postId = req.params.postId;

  if (postId == undefined) {
    return res.status(400).json({ message: 'PostId is required' });
  }

  const query = `SELECT COUNT(*) as count FROM UserLikes Where PostID = ?`;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Error checking like status' });
    }

    if (results) {
      return res.status(200).json(results[0].count);
    }
  });
});

// API kiểm tra người dùng đã like bài viết hay chưa
app.get('/api/posts/:userId/is-liked/:postId', (req, res) => {
  const userId = req.params.userId;
  const postId = req.params.postId;

  if (userId === undefined || userId == null) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const query = `
    SELECT *
    FROM UserLikes
    WHERE UserID = ? AND PostID = ?
  `;

  db.query(query, [userId, postId], (err, results) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Error checking like status' });
    }

    if (results.length === 0) {
      return res.status(200).json({ isLiked: false });
    } else {
      return res.status(200).json({ isLiked: true });
    }
  });
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

// API đăng nhập bằng google
app.post('/api/google-login', (req, res) => {
  const { Email, FullName, AvatarUrl } = req.body;

  // Kiểm tra xem user đã tồn tại chưa
  const queryCheck = 'SELECT * FROM user WHERE email = ?';
  db.query(queryCheck, [Email], (err, results) => {
    if (err) {
      console.error('Database error:', err); // Ghi lại lỗi cơ sở dữ liệu
      return res
        .status(500)
        .json({ message: 'Lỗi khi truy vấn cơ sở dữ liệu' });
    }
    if (results.length > 0) {
      // Nếu user đã tồn tại, trả về thông tin
      res
        .status(200)
        .json({ message: 'Đăng nhập thành công!', user: results[0] });
    } else {
      // Nếu chưa tồn tại, thêm user vào database
      const queryInsert =
        'INSERT INTO user (fullname, email, avatarurl) VALUES (?, ?, ?)';
      db.query(queryInsert, [FullName, Email, AvatarUrl], (err, result) => {
        if (err) throw err;
        // Lấy id của user vừa thêm
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
      });
    }
  });
});

// API đăng ký (Register)


app.post('/api/register', async (req, res) => {
  const { Email, FullName, PhoneNumber, AvatarUrl, Password, Role } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!Email || !Password || !Role) {
      return res.status(400).json({ message: 'Email, Password, and Role are required' });
    }

    // Kiểm tra Role hợp lệ (Customer hoặc Helper)
    const validRoles = ['Khách hàng', 'Người giúp việc', 'Admin'];
    if (!validRoles.includes(Role)) {
      return res.status(400).json({ message: 'Role must be either Customer or Helper' });
    }

    // Băm mật khẩu
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(Password.trim());
    } catch (error) {
      console.error('Lỗi khi băm mật khẩu:', error);
      return res.status(500).json({ message: 'Error hashing password', error: error.message });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const [existingUser] = await db.query(
      `SELECT * FROM User WHERE Email = ?`,
      [Email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "This Account already exists, let's Sign In",
      });
    }

    // Lấy RoleID từ bảng Role
    const [role] = await db.query(
      `SELECT RoleID FROM Role WHERE RoleName = ?`,
      [Role]
    );
    if (role.length === 0) {
      return res.status(400).json({ message: `Role ${Role} not found in the system` });
    }
    const roleId = role[0].RoleID;

    // Tạo tài khoản mới
    const [result] = await db.query(
      `
      INSERT INTO User (Email, Password, FullName, PhoneNumber, AvatarUrl, RoleID)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [Email, hashedPassword, FullName, PhoneNumber, AvatarUrl, roleId]
    );

    // Lấy thông tin User vừa tạo
    const [newUser] = await db.query(
      `SELECT UserID, Email, FullName, PhoneNumber, AvatarUrl, RoleID FROM User WHERE UserID = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Account created successfully!',
      user: newUser[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { Email, FullName, PhoneNumber, Address, Password, Role, AvatarUrl } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!Email || !Password || !FullName || !PhoneNumber || !Address || !Role) {
      return res.status(400).json({ message: 'Email, Password, FullName, PhoneNumber, Address, and Role are required' });
    }

    // Kiểm tra Role hợp lệ (Admin, Customer, hoặc Helper)
    const validRoles = ['Admin', 'Customer', 'Helper'];
    if (!validRoles.includes(Role)) {
      return res.status(400).json({ message: 'Role must be either Admin, Customer, or Helper' });
    }

    // Băm mật khẩu
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(Password.trim());
    } catch (error) {
      console.error('Lỗi khi băm mật khẩu:', error);
      return res.status(500).json({ message: 'Error hashing password', error: error.message });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const [existingUser] = await db.query(
      `SELECT * FROM User WHERE Email = ?`,
      [Email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "This Account already exists, let's Sign In",
      });
    }

    // Lấy RoleID từ bảng Role
    const [role] = await db.query(
      `SELECT RoleID FROM Role WHERE RoleName = ?`,
      [Role]
    );
    if (role.length === 0) {
      return res.status(400).json({ message: `Role ${Role} not found in the system` });
    }
    const roleId = role[0].RoleID;

    // Tạo tài khoản mới
    const [result] = await db.query(
      `
      INSERT INTO User (Email, Password, FullName, PhoneNumber, Address, AvatarUrl, RoleID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [Email, hashedPassword, FullName, PhoneNumber, Address, AvatarUrl, roleId]
    );

    // Lấy thông tin User vừa tạo
    const [newUser] = await db.query(
      `SELECT UserID, Email, FullName, PhoneNumber, Address, AvatarUrl, RoleID FROM User WHERE UserID = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Account created successfully!',
      user: newUser[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// API đăng nhập (Login)
app.post('/api/login', async (req, res) => {
  const { Email } = req.body;
  let { Password } = req.body;
  try {
    // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
    db.query(
      `SELECT * FROM user  WHERE Email = ?`,
      [Email],
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
        const isPasswordValid = await comparePassword(Password, user.Password);
        if (!isPasswordValid) {
          return res.status(400).json({
            message:
              "Invalid email or password or you register by google before, Let's login by google",
          });
        }

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

// API đăng nhập (Login) của Admin
app.post('/api/login/admin', async (req, res) => {
  const { Email } = req.body;
  let { Password } = req.body;
  Password = Password.trim();
  try {
    // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
    db.query(
      `SELECT * FROM user join role on user.UserID = role.UserID  WHERE Email = ?`,
      [Email],
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
        const isPasswordValid = await comparePassword(Password, user.Password);
        if (!isPasswordValid) {
          return res.status(400).json({
            message:
              "Invalid email or password or you register by google before, Let's login by google",
          });
        }

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
////////////////////////////////////////////////////////////////////////////////

// API lấy thông tin cơ bản của tour theo tourid
// Chuyển db.query thành hàm Promise
const queryAsync = util.promisify(db.query).bind(db);
app.get('/api/basis_inf/:tourid', async (req, res) => {
  try {
    const tourid = req.params.tourid;

    const query = `
      SELECT * FROM tour 
      JOIN schedule s ON tour.TourID = s.TourID
      WHERE tour.TourID = ?`;

    const sql = `
      SELECT * FROM tour  
      JOIN tour_service ts ON ts.TourID = tour.TourID 
      WHERE tour.TourID = ?`;

    const query1 = `SELECT it.* FROM tour 
    JOIN Itinerary it ON tour.TourID = it.TourID WHERE tour.TourID = ?`;

    // Thực hiện truy vấn
    const results1 = await queryAsync(query, [tourid]);
    const results2 = await queryAsync(sql, [tourid]);
    const results3 = await queryAsync(query1, [tourid]);

    // Xử lý dữ liệu
    const tourInf = results1[0] || null;

    const serviceForms = results2.map((service) => ({
      ServiceID: service.ServiceID,
      Capacity: service.Capacity,
      Status: service.Status,
    }));

    const dateForms = results1.map((schedule) => ({
      date: schedule.StartDate,
      Capacity: schedule.Capacity,
    }));

    // Trả về kết quả JSON
    res
      .status(200)
      .json({ tourInf, serviceForms, dateForms, itinerary: results3 });
  } catch (err) {
    console.error('Error fetching tour information:', err);
    res.status(500).json({ message: 'Error fetching tour information' });
  }
});

// API lấy danh sách các tour
app.get('/api/tour', (req, res) => {
  const query = `select * from tour where tour.IsDeleted = 0`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.status(200).json(results);
    }
  });
});

// API lấy thông tin tri tiết của tour theo tourid
app.get('/api/tour/:tourid/', (req, res) => {
  const tourid = req.params.tourid;
  const query = `select * from tour
  where tour.tourid = ?`;
  db.query(query, [tourid], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.json(results[0]);
    }
  });
});

// API lấy danh sách schedule của tourID
app.get('/api/tour/:tourid/schedule', (req, res) => {
  const tourid = req.params.tourid;
  const query = `select schedule.*, tour.* from tour
  join schedule ts on tour.tourid = ts.tourid
  join schedule on ts.ScheduleID = schedule.ScheduleID
  where tour.tourid = ? and tour.IsDeleted = 0`;
  db.query(query, [tourid], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.json(results);
    }
  });
});

// API lấy danh sách service của tourid
app.get('/api/tour/:tourid/service', (req, res) => {
  const tourid = req.params.tourid;
  const query = `select service.*, ts.* from tour
  join tour_service ts on tour.tourid = ts.tourid
  join service on ts.serviceid = service.serviceid
  where tour.tourid = ?`;
  db.query(query, [tourid], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.json(results);
    }
  });
});

// API dùng để xóa tour tạm thời
app.put('/api/tour/:tourID', (req, res) => {
  const tourID = req.params.tourID;
  console.log(tourID);
  const query = `UPDATE tour SET IsDeleted = TRUE WHERE TourID = ?`;
  db.query(query, [tourID], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error delete tour' });
    } else {
      res.status(200).json({ message: 'Tour was deleted successfully' });
    }
  });
});

// API tạo service
app.post('/api/create_service', (req, res) => {
  const service = req.body;
  const query = `INSERT INTO service (ServiceName, Description, Price) VALUE (?,?,?)`;
  db.query(
    query,
    [service.ServiceName, service.Description, service.Price],
    (err, results) => {
      if (err) {
        res.status(500).json({ message: 'Error create service' });
      } else {
        res.status(200).json({
          message: 'Service created successfully',
        });
      }
    }
  );
});

// APi dùng để lấy danh sách service
app.get('/api/services', (req, res) => {
  const query = `select * from service`;
  db.query(query, (err, results) => {
    if (err) {
      console.log('Error retrieving services');
      res.status(500).json({ message: 'Error retrieving services' });
    } else {
      res.json(results);
    }
  });
});

//API dùng để xóa tạm thời service
app.put('/api/delete_service/:serviceId', (req, res) => {
  const serviceId = req.params.serviceId;
  console.log(serviceId);
  const query = `UPDATE service SET IsDeleted = TRUE WHERE ServiceID = ?`;
  db.query(query, [serviceId], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error updating service' });
    } else {
      res
        .status(200)
        .json({ message: 'Service marked as deleted successfully' });
    }
  });
});

//API dùng để khôi phục service
app.put('/api/restore_service/:serviceId', (req, res) => {
  const serviceId = req.params.serviceId;
  const query = `UPDATE service SET IsDeleted = FALSE WHERE ServiceID = ?`;
  db.query(query, [serviceId], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error updating service' });
    } else {
      res
        .status(200)
        .json({ message: 'Service marked as restored successfully' });
    }
  });
});

// API dùng để edit service
app.put('/api/update_service', (req, res) => {
  const query = `UPDATE service SET ServiceName = ?, Price = ?, Description = ? WHERE ServiceID = ?`;
  db.query(
    query,
    [
      req.body.ServiceName,
      req.body.Price,
      req.body.Description,
      req.body.ServiceID,
    ],
    (err, results) => {
      if (err) {
        res.status(500).json({ message: 'Error update service' });
      } else {
        res.status(200).json({ message: 'Service updated successfully' });
      }
    }
  );
});

// API dùng để lấy danh sách các booking
app.get('/api/booking', (req, res) => {
  const query = `SELECT booking.*, s.StartDate, tour.* FROM booking JOIN Schedule ts on ts.ScheduleID = booking.ScheduleID 
join schedule s on s.ScheduleID = ts.ScheduleID 
join tour on tour.TourID = ts.TourID WHERE booking.IsDeleted = FALSE`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving booking' });
    } else {
      res.json(results);
    }
  });
});

// API dùng để lấy danh sách các booking Của người dùng
app.get('/api/booking/:userID', (req, res) => {
  const userID = req.params.userID;
  const query = `SELECT booking.*, s.StartDate, tour.* FROM booking JOIN Schedule ts on ts.ScheduleID = booking.ScheduleID 
join schedule s on s.ScheduleID = ts.ScheduleID 
join tour on tour.TourID = ts.TourID AND booking.UserID = ?`;
  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving booking' });
    } else {
      res.json(results);
    }
  });
});

// API dùng để tạo booking
app.post('/api/create_booking', async (req, res) => {
  const buyer = req.body.Buyer;
  const participants = req.body.Participant;
  const schedulePicked = req.body.schedulePicked;
  const selectedOptions = req.body.selectedOptions;
  const total = req.body.total;

  const queryAsync = (sql, values) => {
    return new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  try {
    // 1️⃣ Tạo booking
    const bookingResult = await queryAsync(
      `INSERT INTO booking (NumberOfGuests, ScheduleID, UserID, TotalAmount) VALUES (?,?,?,?)`,
      [participants.length, schedulePicked.ScheduleID, buyer.UserID, total]
    );
    const bookingID = bookingResult.insertId;

    // 2️⃣ Lấy thông tin Schedule
    const scheduleResult = await queryAsync(
      `SELECT * FROM schedule WHERE ScheduleID = ?`,
      [schedulePicked.ScheduleID]
    );
    if (!scheduleResult.length) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // 3️⃣ Giảm số lượng AvailableSpots
    const availableSpots =
      scheduleResult[0].AvailableSpots - participants.length;

    console.log('availableSpots:', availableSpots);
    const query =
      availableSpots === 0
        ? `UPDATE schedule SET AvailableSpots = ?, Status = 'Full' WHERE ScheduleID = ?`
        : `UPDATE schedule SET AvailableSpots = ? WHERE ScheduleID = ?`;
    db.query(
      query,
      [availableSpots, schedulePicked.ScheduleID],
      (err, result) => {}
    );
    // 4️⃣ Thêm thông tin Participant (Chạy song song với Promise.all)
    const participantPromises = participants.map((part) => {
      return queryAsync(
        `INSERT INTO participant (BookingID, Email, FullName, FullNameOnPassport, Nationality, PassportNumber, DateOfBirth, Gender, PhoneNumber) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          bookingID,
          part.email,
          part.firstName + ' ' + part.lastName,
          part.fullNameOnPassport,
          part.nationality,
          part.passportNumber,
          part.dateOfBirth,
          part.gender,
          part.phoneNumber,
        ]
      );
    });

    // 5️⃣ Thêm booking services (Chạy song song với Promise.all)
    const servicePromises = selectedOptions.map((option) => {
      return queryAsync(
        `INSERT INTO booking_service (BookingID, ServiceID, Quantity) VALUES (?,?,?)`,
        [bookingID, option.ServiceID, option.Quantity]
      );
    });

    // Giảm số lượng available của service đã chọn của tour
    const servicePromises2 = selectedOptions.map((option) => {
      return queryAsync(
        `UPDATE tour_service SET AvailableSpots = ? WHERE ServiceID = ? AND TourID = ?`,
        [
          option.AvailableSpots - option.Quantity,
          option.ServiceID,
          schedulePicked.TourID,
        ]
      );
    });

    // Chạy các truy vấn INSERT song song để tăng tốc độ xử lý
    await Promise.all([
      ...participantPromises,
      ...servicePromises,
      ...servicePromises2,
    ]);

    res.status(200).json({ message: 'Tour Booked Successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/delete_booking', (req, res) => {
  const bookingID = req.body.bookingId;
  const query = `UPDATE booking SET IsDeleted = true WHERE BookingID = ?`;
  db.query(query, [bookingID], (err, result) => {
    if (err) {
      console.log('Error delete booking');
      return res.status(500).json({ message: 'Error delete booking' });
    }
    res.status(200).json({
      message: 'Booking deleted successfully',
    });
  });
});
//API dùng để approve booking
app.post('/api/change_status', async (req, res) => {
  const bookingId = req.body.bookingId;
  const status = req.body.status;
  const queryAsync = (sql, values) => {
    return new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  if (status === 'Cancelled') {
    const query = `SELECT * FROM booking
    join participant on booking.BookingID = participant.BookingID WHERE booking.BookingID = ?`;
    db.query(query, [bookingId], async (err, result) => {
      if (err) {
        console.log('Error get booking');
        return res.status(500).json({ message: 'Error get booking' });
      }
      const scheduleResult = await queryAsync(
        `SELECT * FROM schedule WHERE ScheduleID = ?`,
        [result[0].ScheduleID]
      );
      if (!scheduleResult.length) {
        return res.status(404).json({ message: 'Schedule not found' });
      }

      db.query(
        `UPDATE schedule SET AvailableSpots = ? WHERE ScheduleID = ?`,
        [
          scheduleResult[0].AvailableSpots + result.length,
          result[0].ScheduleID,
        ],
        (err, result) => {}
      );
    });
  }

  const query = `UPDATE booking SET Status = ? WHERE BookingID = ?`;
  db.query(query, [status, bookingId], (err, result) => {
    if (err) {
      console.log('Error approve booking');
      return res.status(500).json({ message: 'Error approve booking' });
    }
    res.status(200).json({ message: 'Booking Approved Successfuly' });
  });
});

//API dùng để lấy thông tin tri tiết về participant của booking
app.get('/api/detail_booking/:bookingId', (req, res) => {
  const bookingId = req.params.bookingId;
  const query = `SELECT * from booking 
join participant on booking.BookingID = participant.BookingID
join schedule on schedule.ScheduleID = booking.ScheduleID 
join tour on tour.TourID = schedule.TourID where booking.BookingID = ?`;
  db.query(query, bookingId, (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Error get detail of booking' });
    } else {
      res.status(200).json(result);
    }
  });
});

// API dùng để lấy thông tin tri tiết của participant theo từng tour
app.get('/api/participant/:tourId/:scheduleId', (req, res) => {
  const tourId = req.params.tourId;
  const scheduleId = req.params.scheduleId;
  const query = `SELECT participant.*, booking.* FROM booking 
                 JOIN schedule ON booking.ScheduleID = schedule.ScheduleID
                 JOIN tour ON schedule.TourID = tour.TourID 
                 join participant on booking.BookingID = participant.BookingID
                 WHERE tour.TourID = ? AND schedule.ScheduleID = ? AND booking.Status != 'Pending' AND booking.IsDeleted = FALSE`;

  db.query(query, [tourId, scheduleId], async (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Error getting participant of tour' });
    }
    res.status(200).json(result);
  });
});

// API dùng để lấy thông tin các service đã booked theo bookingId
app.get('/api/booked_service/:bookingId', (req, res) => {
  const bookingId = req.params.bookingId;
  const query = `SELECT * FROM booking
  join booking_service bs on booking.BookingID = bs.BookingID
  join service on bs.ServiceID = service.ServiceID where booking.BookingID = ?`;
  db.query(query, bookingId, (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Error get booked service of booking' });
    } else {
      res.status(200).json(result);
    }
  });
});

// API dùng để tạo tour
app.post('/api/create_tour', async (req, res) => {
  const tourInf = req.body.tourInf;
  const dateForms = req.body.dateForms;
  const serviceForms = req.body.serviceForms;
  const itinerary = req.body.itinerary;

  const query = `INSERT INTO tour (TourName, Description, Price, Img_Tour, Duration) VALUES (?,?,?,?,?)`;

  db.query(
    query,
    [
      tourInf.TourName,
      tourInf.Description,
      tourInf.Price,
      tourInf.Img_Tour,
      tourInf.Duration,
    ],
    (err, result) => {
      if (err) {
        console.log('Error create tour', err);
        return res.status(500).json({ message: 'Error create tour' });
      } else {
        const tourID = result.insertId;
        dateForms.map((date) => {
          const query = `INSERT INTO schedule (TourID, StartDate, Capacity, AvailableSpots) VALUES (?,?,?,?)`;
          db.query(
            query,
            [tourID, date.date, date.Capacity, date.Capacity],
            (err, result) => {
              if (err) {
                console.log('Error create schedule', err);

                return res
                  .status(500)
                  .json({ message: 'Error create schedule for tour' });
              }
            }
          );
        });

        serviceForms.map((service) => {
          const query = `INSERT INTO tour_service(TourID, ServiceID, AvailableSpots, Capacity ,Status) VALUES (?,?,?,?,?)`;
          db.query(
            query,
            [
              tourID,
              service.ServiceID,
              service.Capacity,
              service.Capacity,
              service.Status,
            ],
            (err, result) => {
              if (err) {
                console.log('Error create service', err);

                return res
                  .status(500)
                  .json({ message: 'Error create service for tour' });
              }
            }
          );
        });
        tourID;

        itinerary.map((item) => {
          const query = `INSERT INTO itinerary(DayNumber, Location, Activities,MealsIncluded, ImageUrl, Description, TourID) VALUES (?,?,?,?,?,?,?)`;

          db.query(
            query,
            [
              item.DayNumber,
              item.Location,
              item.Activities,
              item.MealsIncluded,
              item.ImageUrl,
              item.Description,
              tourID,
            ],
            (err, result) => {
              if (err) {
                console.log('Error create itinerary', err);

                return res
                  .status(500)
                  .json({ message: 'Error create itinerary for tour' });
              }
            }
          );
        });

        res.status(200).json({
          message: 'schedule for tour created successfully',
        });
      }
    }
  );
});

// API dùng để chỉnh sửa tour
app.put('/api/edit_tour', async (req, res) => {
  try {
    const { tourInf, dateForms, serviceForms, itinerary } = req.body;
    // Kiểm tra tourID
    if (!tourInf.TourID) {
      return res.status(400).json({ message: 'Missing TourID' });
    }

    // Cập nhật thông tin tour
    const updateTourQuery = `
      UPDATE tour 
      SET TourName = ?, Description = ?, Price = ?, Img_Tour = ?, Duration = ?
      WHERE TourID = ?
    `;

    await queryAsync(updateTourQuery, [
      tourInf.TourName,
      tourInf.Description,
      tourInf.Price,
      tourInf.Img_Tour,
      tourInf.Duration,
      tourInf.TourID,
    ]);

    if (dateForms) {
      for (const date of dateForms) {
        // Kiểm tra xem lịch trình có tồn tại không
        const checkScheduleQuery = `SELECT * FROM schedule WHERE TourID = ? AND StartDate = ?`;
        const existingSchedule = await queryAsync(checkScheduleQuery, [
          tourInf.TourID,
          date.date,
        ]);

        if (existingSchedule.length > 0) {
          // Nếu tồn tại, cập nhật số lượng chỗ trống
          const updateScheduleQuery = `
          UPDATE schedule 
          SET Capacity = ?, AvailableSpots = ?
          WHERE TourID = ? AND StartDate = ?
        `;
          await queryAsync(updateScheduleQuery, [
            date.Capacity,
            date.AvailableSpots,
            tourInf.TourID,
            date.date,
          ]);
        } else {
          // Nếu chưa tồn tại, chèn mới
          const insertScheduleQuery = `
          INSERT INTO schedule (TourID, StartDate, Capacity, AvailableSpots) 
          VALUES (?, ?, ?, ?)
        `;
          await queryAsync(insertScheduleQuery, [
            tourInf.TourID,
            date.date,
            date.Capacity,
            date.AvailableSpots,
          ]);
        }
      }
    }

    if (serviceForms) {
      for (const service of serviceForms) {
        const checkServiceQuery = `SELECT * FROM tour_service WHERE TourID = ? AND ServiceID = ?`;
        const existingService = await queryAsync(checkServiceQuery, [
          tourInf.TourID,
          service.ServiceID,
        ]);

        if (existingService.length > 0) {
          // Nếu dịch vụ đã tồn tại, cập nhật lại
          const updateServiceQuery = `
          UPDATE tour_service 
          SET AvailableSpots = ?, Capacity = ?, Status = ?
          WHERE TourID = ? AND ServiceID = ?
        `;
          await queryAsync(updateServiceQuery, [
            service.AvailableSpots,
            service.Capacity,
            service.Status,
            tourInf.TourID,
            service.ServiceID,
          ]);
        } else {
          // Nếu chưa tồn tại, chèn mới
          const insertServiceQuery = `
          INSERT INTO tour_service (TourID, ServiceID, AvailableSpots, Capacity, Status) 
          VALUES (?, ?, ?, ?, ?)
        `;
          await queryAsync(insertServiceQuery, [
            tourInf.TourID,
            service.ServiceID,
            service.AvailableSpots,
            service.Capacity,
            service.Status,
          ]);
        }
      }
    }

    if (itinerary) {
      for (const item of itinerary) {
        const checkItineraryQuery = `SELECT * FROM itinerary WHERE TourID = ? AND DayNumber = ?`;
        const existingItinerary = await queryAsync(checkItineraryQuery, [
          tourInf.TourID,
          item.DayNumber,
        ]);

        if (existingItinerary.length > 0) {
          // Nếu đã tồn tại, cập nhật thông tin
          const updateItineraryQuery = `
          UPDATE itinerary 
          SET Location = ?, Activities = ?, MealsIncluded = ?, ImageUrl = ?, Description = ?
          WHERE TourID = ? AND DayNumber = ?
        `;
          await queryAsync(updateItineraryQuery, [
            item.Location,
            item.Activities,
            item.MealsIncluded,
            item.ImageUrl,
            item.Description,
            tourInf.TourID,
            item.DayNumber,
          ]);
        } else {
          // Nếu chưa tồn tại, chèn mới
          const insertItineraryQuery = `
          INSERT INTO itinerary (DayNumber, Location, Activities, MealsIncluded, ImageUrl, Description, TourID) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
          await queryAsync(insertItineraryQuery, [
            item.DayNumber,
            item.Location,
            item.Activities,
            item.MealsIncluded,
            item.ImageUrl,
            item.Description,
            tourInf.TourID,
          ]);
        }
      }
    }

    res.status(200).json({ message: 'Tour updated successfully' });
  } catch (err) {
    console.error('Error updating tour:', err);
    res.status(500).json({ message: 'Error updating tour' });
  }
});

// API lấy danh sách user
app.get('/api/users_list', (req, res) => {
  const query = `SELECT * from user`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving user' });
    } else {
      res.status(200).json(results);
    }
  });
});

// API lấy danh sách admin
app.get('/api/admins_list', (req, res) => {
  const query = `select * from user join role on user.UserID = role.UserID`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving admin list' });
    } else {
      res.json(results);
    }
  });
});

// API promote admin hay manager
app.post('/api/promote', (req, res) => {
  const user = req.body.user;
  const query = `SELECT * FROM user join role on user.UserID = role.UserID WHERE email = ?`;
  db.query(query, [user.Email], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error promote user' });
    } else {
      if (results.length === 0) {
        const query = `INSERT INTO role (UserID, Role) VALUES (?, ?)`;
        db.query(query, [user.UserID, req.body.role], (err, results) => {
          if (err) {
            res.status(500).json({ message: 'Error promote user' });
          } else {
            res.json({ message: 'User promoted successfully' });
          }
        });
      } else {
        const query = `UPDATE role SET Role = ? WHERE UserID = ?`;
        db.query(query, [req.body.Role, user.UserID], (err, results) => {
          if (err) {
            res.status(500).json({ message: 'Error promote user' });
          } else {
            res.status(200).json({ message: 'User promoted successfully' });
          }
        });
      }
    }
  });
});

// API dùng để xóa user
app.put('/api/delete_user', (req, res) => {
  const query = `UPDATE user SET IsDeleted = true WHERE UserID = ?`;
  db.query(query, [req.body.UserID], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error delete user' });
    } else {
      res.status(200).json({ message: 'User deleted successfully' });
    }
  });
});

// APi dùng để chỉnh sửa thông tin user
app.put('/api/update_user', (req, res) => {
  const query = `UPDATE user SET FullName = ?, Email = ?, Password = ?, PhoneNumber = ? WHERE UserID = ?`;
  db.query(
    query,
    [
      req.body.FullName,
      req.body.Email,
      req.body.Password,
      req.body.PhoneNumber,
      req.body.UserID,
    ],
    (err, results) => {
      if (err) {
        res.status(500).json({ message: 'Error update user' });
      } else {
        res.status(200).json({ message: 'User updated successfully' });
      }
    }
  );
});

// API dùng để gián chức user
app.delete('/api/dismissal/:UserID', (req, res) => {
  const query = `DELETE FROM role WHERE UserID = ?`;
  db.query(query, [req.params.UserID], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error dismissal user' });
    } else {
      res.status(200).json({
        message: 'User dismissed successfully',
      });
    }
  });
});

// API lấy thống kê đặt tour theo năm/quý
app.get('/api/statistics', async (req, res) => {
  const { year, quarter } = req.query;

  let condition = '';
  let params = [];

  // Nếu có năm
  if (year) {
    condition += ` YEAR(b.BookingDate) = ?`;
    params.push(year);
  }

  // Nếu có quý (quarter = 1,2,3,4 hoặc 5 là cả năm)
  if (quarter && quarter != 5) {
    condition += ` AND QUARTER(b.BookingDate) = ?`;
    params.push(quarter);
  }

  // Nếu có điều kiện, thêm WHERE vào SQL
  condition = condition ? ` WHERE ${condition.replace(/^ AND/, '')}` : '';

  const sql = `
    SELECT 
      COUNT(b.BookingID) AS totalBookings, 
      SUM(b.TotalAmount) AS totalRevenue, 
      SUM(b.NumberOfGuests) AS totalGuests
    FROM Booking b ${condition}
  `;

  const query = `
    SELECT AVG(DATEDIFF(CURDATE(), p.DateOfBirth) / 365) AS avgAge
    FROM Booking b 
    LEFT JOIN Participant p ON b.BookingID = p.BookingID
    ${condition}
  `;

  try {
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal Server Error' });
      }
      const stats = result[0];
      db.query(query, params, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send({ message: 'Internal Server Error' });
        }
        const avgAge = result[0].avgAge;
        res.status(200).json({ stats, avgAge });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API lấy dữ liệu biểu đồ tỷ lệ lấp đầy tour
app.get('/api/tour-capacity', async (req, res) => {
  try {
    const { year, quarter } = req.query;

    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Vui lòng cung cấp năm hợp lệ' });
    }

    let startDate, endDate;

    // const today = new Date().toISOString().split('T')[0];

    // if (quarter >= 1 && quarter <= 4) {
    //   // Xác định ngày đầu và cuối của quý
    //   const startMonth = (quarter - 1) * 3 + 1;
    //   startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    //   let calculatedEndDate = new Date(year, startMonth + 2, 0)
    //     .toISOString()
    //     .split('T')[0];

    //   // Đảm bảo endDate không vượt quá ngày hiện tại
    //   endDate = calculatedEndDate > today ? today : calculatedEndDate;
    // } else if (quarter == 5) {
    //   // Nếu quarter = 5, lấy cả năm nhưng không vượt quá ngày hiện tại
    //   startDate = `${year}-01-01`;
    //   let calculatedEndDate = `${year}-12-31`;

    //   // Đảm bảo endDate không vượt quá ngày hiện tại
    //   endDate = calculatedEndDate > today ? today : calculatedEndDate;
    // } else {
    //   return res
    //     .status(400)
    //     .json({ error: 'Quý không hợp lệ, chỉ nhận giá trị từ 1-5' });
    // }

    if (quarter >= 1 && quarter <= 4) {
      // Xác định ngày đầu và cuối của quý
      const startMonth = (quarter - 1) * 3 + 1; // Quý 1 -> tháng 1, Quý 2 -> tháng 4, ...
      startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
      endDate = new Date(year, startMonth + 2, 0).toISOString().split('T')[0]; // Ngày cuối của tháng cuối trong quý
    } else if (quarter == 5) {
      // Nếu quarter = 5, lấy cả năm
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    } else {
      return res
        .status(400)
        .json({ error: 'Quý không hợp lệ, chỉ nhận giá trị từ 1-5' });
    }

    const query = `
      SELECT * FROM Schedule s
      WHERE DATE(s.StartDate) BETWEEN ? AND ?;
    `;

    // Thực hiện truy vấn
    const [result] = await db.promise().query(query, [startDate, endDate]);

    const tourCapacity = result.reduce(
      (acc, schedule) => {
        acc[0] = schedule.AvailableSpots
          ? acc[0] + schedule.AvailableSpots
          : acc[0] + 0;
        acc[1] = schedule.Capacity ? acc[1] + schedule.Capacity : acc[1] + 0;
        return acc;
      },
      [0, 0]
    );

    // Tính toán tỷ lệ lấp đầy
    res.json({
      filled: tourCapacity[1] - tourCapacity[0],
      notFilled: tourCapacity[0],
      period: quarter == 5 ? `Năm ${year}` : `Quý ${quarter} năm ${year}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API dùng để lấy thông tin về sóo lượng khách và doanh thu theo từng tour
app.get('/api/tour-statistics', async (req, res) => {
  try {
    const { year, quarter } = req.query;

    let condition = '';
    let params = [];

    // Nếu có năm
    if (year) {
      condition += ` YEAR(b.BookingDate) = ?`;
      params.push(year);
    }

    // Nếu có quý (quarter = 1,2,3,4 hoặc 5 là cả năm)
    if (quarter && quarter != 5) {
      condition += ` AND QUARTER(b.BookingDate) = ?`;
      params.push(quarter);
    }

    condition = condition ? ` WHERE ${condition.replace(/^ AND/, '')}` : '';

    const sql = `
      SELECT 
        s.ScheduleID, 
        SUM(b.NumberOfGuests) AS totalGuests,
        SUM(b.TotalAmount) AS totalRevenue
      FROM Booking b
      JOIN Schedule s ON b.ScheduleID = s.ScheduleID
       ${condition}
      GROUP BY s.ScheduleID 
    `;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }

      const guestData = results.map((tour) => tour.totalGuests || 0);
      const revenueData = results.map((tour) => tour.totalRevenue || 0); // Đổi đơn vị thành triệu VND

      res.json({
        datasets: [
          {
            data: revenueData,
          },
          {
            data: guestData,
          },
        ],
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API lấy thông tin lịch trình itinerary
app.get('/api/itinerary/:tourId', (req, res) => {
  const tourId = req.params.tourId;
  db.query(
    `SELECT * FROM itinerary WHERE TourID = ?`,
    [tourId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }

      res.status(200).json(results);
    }
  );
});

// Cấu hình để có thể truy cập ảnh từ thư mục uploads
app.use('/uploads', express.static('uploads'));
// Khởi động server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
