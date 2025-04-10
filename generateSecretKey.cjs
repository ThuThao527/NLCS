const crypto = require('crypto');

// Tạo secret key ngẫu nhiên (dài 32 byte, mã hóa thành hex -> 64 ký tự)
const secretKey = crypto.randomBytes(32).toString('hex');
console.log('Generated Secret Key:', secretKey);