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
    // origin: 'http://localhost:5174', // Cho phép yêu cầu từ front-end trên cổng 5173
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

// API đăng nhập bằng google
app.post('/api/google-login', (req, res) => {
  const { email, name, image_avatar } = req.body;

  // Kiểm tra xem user đã tồn tại chưa
  const queryCheck = 'SELECT * FROM users WHERE email = ?';
  pool.query(queryCheck, [email], (err, results) => {
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
        'INSERT INTO users (username, email, image_avatar) VALUES (?, ?, ?)';
      pool.query(queryInsert, [name, email, image_avatar], (err, result) => {
        if (err) throw err;
        // Lấy id của user vừa thêm
        const queryGetId = result.insertId;
        res.status(201).json({
          message: 'Tạo tài khoản mới và đăng nhập thành công!',
          user: {
            id: queryGetId,
            username: name,
            email: email,
            role: 'user',
            image_avatar: image_avatar,
          },
        });
      });
    }
  });
});

// API đăng ký (Register)
app.post('/api/register', async (req, res) => {
  const { email, password, name, image_avatar } = req.body;

  try {
    // Kiểm tra xem email đã tồn tại chưa
    pool.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Database error', error: err.message });
      }

      if (results.length > 0) {
        // Nếu email đã tồn tại
        return res.status(400).json({
          message: "This Account is already, let's Sign In",
        });
      }

      // Nếu email chưa tồn tại, tiến hành tạo tài khoản
      pool.query(
        `INSERT INTO users (email, password, username, image_avatar) VALUE (?, ?, ?, ?)`,
        [email, password, name, image_avatar],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: 'Database error', error: err.message });
          }

          const queryGetId = result.insertId;

          res.status(201).json({
            message: 'Account created successfully',
            user: {
              id: queryGetId,
              username: name,
              email: email,
              role: 'user',
              image_avatar: image_avatar,
            },
          });
        }
      );
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error creating user', error: error.message });
  }
});

// API đăng nhập (Login)
app.post('/api/loginold', async (req, res) => {
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

app.post('/api/login',  (req, res) => {
  const { Email } = req.body;
  let { Password } = req.body;
  Password = Password.trim();

  // Kiểm tra dữ liệu đầu vào
  if (!Email || !Password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(Email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Kiểm tra email trong bảng User
  pool.query(
    `SELECT * FROM user WHERE Email = ?`,
    [Email],
    (err, userResults) => {
      if (err) {
        console.error('Database error (User table):', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      // Nếu tìm thấy user trong bảng User
      if (userResults.length > 0) {
        const user = userResults[0];

        // Kiểm tra mật khẩu
        bcrypt.compare(Password, user.Password, (err, isPasswordValid) => {
          if (err) {
            console.error('Error comparing password:', err);
            return res.status(500).json({ message: 'Error comparing password', error: err.message });
          }

          if (!isPasswordValid) {
            return res.status(400).json({
              message: "Invalid email or password or you registered with Google, please login with Google",
            });
          }

          // Tạo token
          const token = jwt.sign(
            { userId: user.UserID, email: user.Email, role: user.Role }, // Payload
            'your-secret-key', // Secret key (nên lưu trong biến môi trường)
            { expiresIn: '1h' } // Thời gian hết hạn: 1 giờ
          );

          // Đăng nhập thành công, trả về thông tin user kèm token
          res.status(200).json({
            message: 'Login successful',
            token, // Trả về token
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
        });
      } else {
        // Nếu không tìm thấy trong bảng User, kiểm tra trong bảng Helper
        pool.query(
          `SELECT * FROM helper WHERE Email = ?`,
          [Email],
          (err, helperResults) => {
            if (err) {
              console.error('Database error (Helper table):', err);
              return res.status(500).json({ message: 'Database error', error: err.message });
            }

            if (helperResults.length === 0) {
              return res.status(400).json({ message: 'Invalid email or password' });
            }

            const helper = helperResults[0];

            // Kiểm tra mật khẩu
            bcrypt.compare(Password, helper.Password, (err, isPasswordValid) => {
              if (err) {
                console.error('Error comparing password:', err);
                return res.status(500).json({ message: 'Error comparing password', error: err.message });
              }

              if (!isPasswordValid) {
                return res.status(400).json({
                  message: "Invalid email or password or you registered with Google, please login with Google",
                });
              }

              // Tạo token
              const token = jwt.sign(
                { userId: helper.HelperID, email: helper.Email, role: 'Helper' }, // Payload
                'your-secret-key', // Secret key (nên lưu trong biến môi trường)
                { expiresIn: '12h' } // Thời gian hết hạn: 12 giờ
              );

              // Đăng nhập thành công, trả về thông tin helper kèm token
              res.status(200).json({
                message: 'Login successful',
                token, // Trả về token
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
            });
          }
        );
      }
    }
  );
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
    // Nếu không có URL hoặc không phải chuỗi, trả về lỗi ngay
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        error: 'Thumbnail URL is missing or invalid',
        thumbnail: null
      };
    }

    // Kiểm tra xem URL có bắt đầu bằng http/https không
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        isValid: false,
        error: 'Thumbnail must be a valid HTTP/HTTPS URL',
        thumbnail: url
      };
    }

    try {
      const response = await axios.head(url, { timeout: 5000 }); // Timeout 5 giây
      const contentType = response.headers['content-type'];

      if (contentType && contentType.startsWith('image/')) {
        return {
          isValid: true,
          error: null,
          thumbnail: url
        };
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
        // Lỗi từ server (ví dụ: 404, 403)
        errorMessage = `HTTP error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        errorMessage = 'Request timed out';
      } else if (error.code === 'ENOTFOUND') {
        // Không tìm thấy domain
        errorMessage = 'Domain not found';
      } else {
        // Lỗi khác
        errorMessage = error.message;
      }

      return {
        isValid: false,
        error: errorMessage,
        thumbnail: url
      };
    }
  }

  pool.query(countQuery, (err, countResults) => {
    if (err) {
      console.log('Error counting blog posts:', err);
      return res.status(500).json({ message: 'Error counting blog posts' });
    }

    const totalPosts = countResults[0].total;
    const totalPages = Math.ceil(totalPosts / limit);

    pool.query(query, [limit, offset], async (err, results) => {
      if (err) {
        console.log('Error retrieving blog posts:', err);
        return res.status(500).json({ message: 'Error retrieving blog posts' });
      }

      // Kiểm tra thumbnail cho từng bài post
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
    });
  });
});

// API lấy chi tiết một blog theo ID
app.get('/api/posts/:id', (req, res) => {
  const blogId = req.params.id;
  const query = `
    SELECT blog.*, categories.Name
    FROM blog
    INNER JOIN categories ON blog.CategoryID = categories.CategoryID
    WHERE blog.BlogID = ?
  `;
  pool.query(query, [blogId], (err, results) => {
    if (err) {
      console.log('Error retrieving blog post:', err);
      res.status(500).json({ message: 'Error retrieving blog post' });
    } else if (results.length === 0) {
      console.log('Blog not found');
      res.status(404).json({ message: 'Blog not found' });
    } else {
      res.json(results[0]);
    }
  });
});

app.get('/api/availabilities', authenticateToken ,async (req, res) => {
  const { date, session, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
  console.log(`Received GET /api/availabilities with date: ${date}, session: ${session}, minPrice: ${minPrice}, maxPrice: ${maxPrice}, page: ${page}, limit: ${limit}`);

  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      a.AvailabilityID, a.HelperID, h.HelperName AS HelperName, a.Date,
      s.SessionID, s.Session,
      hr.StartTime, hr.EndTime, hr.Rate AS Price
    FROM availability a
    JOIN helper h ON a.HelperID = h.HelperID
    LEFT JOIN availability_sessions s ON a.AvailabilityID = s.AvailabilityID
    LEFT JOIN helperRate hr ON h.HelperID = hr.HelperID 
      AND a.Date BETWEEN hr.StartDate AND hr.EndDate
    WHERE a.Status = 'Available'
  `;
  const params = [];

  if (date) {
    query += ` AND a.Date = ?`;
    params.push(date);
  }
  if (session) {
    query += ` AND s.Session = ?`;
    params.push(session);
  }
  if (minPrice || maxPrice) {
    query += ` AND hr.Rate BETWEEN ? AND ?`;
    params.push(minPrice || 0, maxPrice || 999999);
  }

  try {
    // Đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS temp`;
    const [countRows] = await pool.execute(countQuery, params);
    const totalAvailabilities = countRows[0].total;
    const totalPages = Math.ceil(totalAvailabilities / limit);

    // Thêm phân trang
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.execute(query, params);

    // Gom nhóm sessions theo availability
    const availabilitiesMap = {};
    rows.forEach(row => {
      if (!availabilitiesMap[row.AvailabilityID]) {
        availabilitiesMap[row.AvailabilityID] = {
          AvailabilityID: row.AvailabilityID,
          HelperID: row.HelperID,
          HelperName: row.HelperName,
          Date: row.Date,
          Sessions: []
        };
      }
      if (row.Session) {
        availabilitiesMap[row.AvailabilityID].Sessions.push({
          SessionID: row.SessionID,
          Session: row.Session,
          StartTime: row.StartTime || 'N/A',
          EndTime: row.EndTime || 'N/A',
          Price: row.Price || 0
        });
      }
    });

    const availabilities = Object.values(availabilitiesMap);

    console.log(`Success: Fetched ${availabilities.length} availabilities`);
    res.json({
      availabilities,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching availabilities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//API tạo booking
app.post('/api/bookings', async (req, res) => {
  const { UserID, HelperID, StartTime, EndTime, Session } = req.body;
  console.log(`Received POST /api/bookings with UserID: ${UserID}, HelperID: ${HelperID}, StartTime: ${StartTime}, EndTime: ${EndTime}, Session: ${Session}`);

  if (!UserID || !HelperID || !StartTime || !EndTime || !Session) {
    console.log('Error: Missing required fields');
    return res.status(400).json({ error: 'All fields (UserID, HelperID, StartTime, EndTime, Session) are required' });
  }

  const date = StartTime.split(' ')[0]; // Lấy ngày từ StartTime

  try {
    // Kiểm tra availability
    const [availRows] = await pool.execute(
      `SELECT a.AvailabilityID
       FROM availability a
       JOIN availability_sessions s ON a.AvailabilityID = s.AvailabilityID
       WHERE a.HelperID = ? AND a.Date = ? AND s.Session = ? AND a.Status = 'Available'`,
      [HelperID, date, Session]
    );

    if (availRows.length === 0) {
      console.log(`Error: No available slot for HelperID ${HelperID} on ${date} with session ${Session}`);
      return res.status(400).json({ error: 'Selected slot is not available' });
    }

    const AvailabilityID = availRows[0].AvailabilityID;

    // Tính TotalCost từ helperRate
    const [rateRows] = await pool.execute(
      `SELECT Rate
       FROM helperRate
       WHERE HelperID = ? AND ? BETWEEN StartDate AND EndDate
         AND StartTime = ? AND EndTime = ?`,
      [HelperID, date, StartTime.split(' ')[1], EndTime.split(' ')[1]]
    );

    const TotalCost = rateRows.length > 0 ? rateRows[0].Rate : 0;

    // Tạo booking
    const [bookingResult] = await pool.execute(
      `INSERT INTO booking (UserID, HelperID, StartTime, EndTime, TotalCost, Status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [UserID, HelperID, StartTime, EndTime, TotalCost]
    );

    // Cập nhật trạng thái availability
    await pool.execute(
      `UPDATE availability SET Status = 'Booked' WHERE AvailabilityID = ?`,
      [AvailabilityID]
    );

    const booking = {
      BookingID: bookingResult.insertId,
      UserID,
      HelperID,
      StartTime,
      EndTime,
      TotalCost,
      Status: 'Pending'
    };

    console.log(`Success: Created booking with BookingID ${booking.BookingID}`);
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Khởi động server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

app.listen(3000, () => {
  console.log('Server running on port 3000');
});