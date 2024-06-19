# My MVC Project

This is a Node.js project following the MVC (Model-View-Controller) architecture. The project uses various modern technologies and libraries to ensure security, maintainability, and scalability.

## Technologies Used

1. **Node.js**: JavaScript runtime for server-side programming.
2. **Express**: Fast, unopinionated, minimalist web framework for Node.js.
3. **MongoDB**: NoSQL database for storing data.
4. **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
5. **EJS**: Embedded JavaScript templating for server-side rendering of HTML.
6. **Dotenv**: Loads environment variables from a `.env` file.
7. **Morgan**: HTTP request logger middleware for Node.js.
8. **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
9. **Helmet**: Helps secure Express apps by setting various HTTP headers.
10. **Winston**: A logger for Node.js.
11. **Express-Validator**: Middleware for validating and sanitizing data.
12. **Bcrypt**: Library to hash passwords.
13. **Joi**: Schema description language and data validator for JavaScript.
14. **Multer**: Middleware for handling `multipart/form-data`, used for file uploads.
15. **Express Async Errors**: Handles errors in async route handlers.
16. **Prettier**: Code formatter.
17. **ESLint**: Linter for identifying and reporting on patterns in JavaScript.
18. **Nodemon**: Utility that monitors for any changes in your source and automatically restarts your server.
19. **Compression**: Middleware to compress response bodies.
20. **Rate-limiter-flexible**: Flexible and robust rate-limiting library for Node.js.
21. **Swagger**: Tools for documenting REST APIs.
22. **module-alias**: Absolute Paths '@/'

## Project Structure

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

## Getting Started

### Prerequisites

-   Node.js (v14.x or later)
-   MongoDB

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-repo/my-mvc-project.git
    cd my-mvc-project

    ```

2. Install dependencies:

```bash
npm install

```

3. Set up environment variables:
   Create a .env file in the root of the project and add your MongoDB URI and other environment variables:

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mydatabase

```

## Running the Project

### Development

To run the project in development mode with automatic restarts on code changes, use:

```bash
npm run dev

```

### Production

To run the project in production mode:

1. Build the project (if you have a build step):

```bash
npm run build

```

2. Start the server:

```bash
npm start

```

Alternatively, you can use pm2 to manage your application in production:

```bash
pm2 start app.js

```

## Using Swagger for API Documentation

Swagger UI is available at /api-docs. To access the API documentation, start the server and navigate to:

```bash
http://localhost:3000/api-docs

```

## Middleware and Utilities

### Environment Variables

Using dotenv to manage environment variables:

```bash
require('dotenv').config()
const port = process.env.PORT || 3000

```

### Logging

Using winston for logging:

```bash
const winston = require('winston')

const logger = winston.createLogger({
level: 'info',
format: winston.format.json(),
transports: [
new winston.transports.File({ filename: 'error.log', level: 'error' }),
new winston.transports.File({ filename: 'combined.log' }),
],
})

if (process.env.NODE_ENV !== 'production') {
logger.add(new winston.transports.Console({
format: winston.format.simple(),
}))
}

module.exports = logger

```

### Request Validation

Using express-validator to validate incoming requests:

```bash
const { body, validationResult } = require('express-validator')

exports.userValidationRules = () => {
return [
body('name').isString().isLength({ min: 3 }),
body('email').isEmail(),
body('password').isLength({ min: 5 }),
]
}

exports.validate = (req, res, next) => {
const errors = validationResult(req)
if (errors.isEmpty()) {
return next()
}
return res.status(400).json({ errors: errors.array() })
}

```

### Security

Using helmet to set various HTTP headers for security:

```bash
const helmet = require('helmet')
app.use(helmet())

```

### Rate Limiting

Using rate-limiter-flexible to limit repeated requests to public APIs and/or endpoints:

```bash
const { RateLimiterMemory } = require('rate-limiter-flexible')

const rateLimiter = new RateLimiterMemory({
points: 10, // 10 requests
duration: 1, // per 1 second by IP
})

app.use((req, res, next) => {
rateLimiter.consume(req.ip)
.then(() => {
next()
})
.catch(() => {
res.status(429).send('Too Many Requests')
})
})

```

### Response Compression

Using compression to reduce the size of the response body:

```bash
const compression = require('compression')
app.use(compression())

```

### Code Formatting and Linting

Prettier
Prettier is configured to format the code. To format the code, run:

```bash
npm run format

```

ESLint
ESLint is configured to lint the code. To lint the code, run:

```bash
npm run lint

```

## Contributing

Please fork the repository and create a pull request with your changes. Make sure to write tests for new features and bug fixes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

-   This `README.md` provides a comprehensive guide to your project, including the technologies used, project structure, setup instructions, and additional configurations for development and production environments. Feel free to copy and use it for your project.
