import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' })); // Tăng giới hạn payload JSON
app.use(express.urlencoded({ limit: '50mb', extended: true }));

axios.defaults.baseURL = ''; // Để trống

app.use(
  cors({
    origin: 'http://localhost:5173', // Cho phép yêu cầu từ front-end trên cổng 5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Cho phép các phương thức HTTP này
    allowedHeaders: ['Content-Type'], // Các headers được phép
  })
);

app.use(express.json());

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
  password: '',
  //password: process.env.PASSWORD_MYSQL, // Thay bằng mật khẩu của bạn
  database: 'Tourmanagement', // Tên database
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


// API lấy danh sách admin
app.get('/api/users/admin', (req, res) => {
  const query = `SELECT * from users where role = 'admin'`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.json(results);
    }
  });
});
// API lấy danh sách danh mục
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM categories';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving categories' });
    } else {
      res.json(results);
    }
  });
});

// API đăng nhập bằng google
app.post('/api/google-login', (req, res) => {
  const { email, name, image_avatar } = req.body;

  // Kiểm tra xem user đã tồn tại chưa
  const queryCheck = 'SELECT * FROM users WHERE email = ?';
  db.query(queryCheck, [email], (err, results) => {
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
      db.query(queryInsert, [name, email, image_avatar], (err, result) => {
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
    db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
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
      db.query(
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
  db.query(
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
        db.query(
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

app.get('/api/posts', (req, res) => {
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

  db.query(countQuery, (err, countResults) => {
    if (err) {
      console.log('Error counting blog posts:', err);
      return res.status(500).json({ message: 'Error counting blog posts' });
    }

    const totalPosts = countResults[0].total;
    const totalPages = Math.ceil(totalPosts / limit);

    db.query(query, [limit, offset], (err, results) => {
      if (err) {
        console.log('Error retrieving blog posts:', err);
        res.status(500).json({ message: 'Error retrieving blog posts' });
      } else {
        res.json({
          posts: results,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalPosts: totalPosts,
            postsPerPage: limit
          }
        });
      }
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
  db.query(query, [blogId], (err, results) => {
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

// Khởi động server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

app.listen(3000, () => {
  console.log('Server running on port 3000');
});