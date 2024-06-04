1. Dotenv
   Mô tả: Để quản lý các biến môi trường một cách an toàn.
   Cài đặt: npm install dotenv
   Sử dụng: Tạo file .env để lưu trữ các biến môi trường của bạn, sau đó sử dụng dotenv để nạp chúng vào ứng dụng.

require('dotenv').config();

// Sử dụng biến môi trường
const port = process.env.PORT || 3000;

2. Morgan
   Mô tả: Logger middleware để ghi log các request HTTP.
   Cài đặt: npm install morgan
   Sử dụng:

const morgan = require('morgan');
app.use(morgan('dev'));

3. Cors
   Mô tả: Để cấu hình và cho phép CORS (Cross-Origin Resource Sharing).
   Cài đặt: npm install cors
   Sử dụng:

const cors = require('cors');
app.use(cors());

4. Helmet
   Mô tả: Để tăng cường bảo mật cho ứng dụng Express.
   Cài đặt: npm install helmet
   Sử dụng:

const helmet = require('helmet');
app.use(helmet());

5. Winston
   Mô tả: Logger cho ứng dụng, cho phép lưu log một cách có cấu trúc.
   Cài đặt: npm install winston
   Sử dụng:

const winston = require('winston');

const logger = winston.createLogger({
level: 'info',
format: winston.format.json(),
transports: [
new winston.transports.File({ filename: 'error.log', level: 'error' }),
new winston.transports.File({ filename: 'combined.log' }),
],
});

if (process.env.NODE_ENV !== 'production') {
logger.add(new winston.transports.Console({
format: winston.format.simple(),
}));
}

module.exports = logger;

6. Express Validator
   Mô tả: Để kiểm tra và xác thực dữ liệu từ các request.
   Cài đặt: npm install express-validator
   Sử dụng:

const { body, validationResult } = require('express-validator');

app.post('/user',
body('email').isEmail(),
body('password').isLength({ min: 5 }),
(req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
}
// Xử lý khi dữ liệu hợp lệ
});

7. Bcrypt
   Mô tả: Để mã hóa và kiểm tra mật khẩu.
   Cài đặt: npm install bcrypt
   Sử dụng:

const bcrypt = require('bcrypt');
const saltRounds = 10;

bcrypt.hash('myPassword', saltRounds, function(err, hash) {
// Lưu hash vào cơ sở dữ liệu
});

bcrypt.compare('myPassword', hash, function(err, result) {
// result là true hoặc false
});

8. Joi
   Mô tả: Schema description language and data validator for JavaScript.
   Cài đặt: npm install joi
   Sử dụng:

const Joi = require('joi');

const schema = Joi.object({
username: Joi.string().alphanum().min(3).max(30).required(),
email: Joi.string().email().required(),
});

const { error, value } = schema.validate({ username: 'abc', email: 'abc@example.com' });

if (error) {
// Xử lý lỗi
} else {
// Dữ liệu hợp lệ
}

9. Multer
   Mô tả: Middleware để xử lý file upload.
   Cài đặt: npm install multer
   Sử dụng:

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/profile', upload.single('avatar'), (req, res) => {
res.send('File uploaded!');
});

10. Express Async Errors
    Mô tả: Để xử lý các lỗi bất đồng bộ một cách dễ dàng.
    Cài đặt: npm install express-async-errors
    Sử dụng:

require('express-async-errors');

// Định nghĩa các route sử dụng async/await mà không cần try/catch
app.get('/', async (req, res) => {
const data = await someAsyncFunction();
res.send(data);
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
console.error(err);
res.status(500).send('Something broke!');
});

11. Prettier và ESLint
Mô tả: Để đảm bảo mã nguồn nhất quán và tuân thủ các quy tắc coding.

Cài đặt:
npm install --save-dev prettier eslint eslint-plugin-prettier eslint-config-prettier

12. nodemon
Mô tả: Để tự động khởi động lại server khi có thay đổi trong mã nguồn.

Cài đặt:
npm install --save-dev nodemon

13. Compression
Mô tả: Để nén HTTP response.

Cài đặt:
npm install compression

14. Rate-limiter-flexible
Mô tả: Để hạn chế số lượng request nhằm bảo vệ khỏi các cuộc tấn công DDoS.

Cài đặt:
npm install rate-limiter-flexible

15. Swagger
Mô tả: Để tạo API documentation.

Cài đặt:
npm install swagger-jsdoc swagger-ui-express

my-mvc-project/
│
├── config/
│ ├── database.js
│ ├── logger.js
│ └── dotenv.js
│
├── controllers/
│ └── user.js
│
├── middleware/
│ └── validator.js
│
├── models/
│ └── user.js
│
├── routes/
│ └── user.js
│
├── views/
│ └── index.ejs
│
├── public/
│ └── css/
│ └── style.css
│
├── uploads/
│
├── app.js
├── .eslintrc.json
├── .prettierrc
├── package.json
└── .env