const SUCCESS_REQUEST = 200;
const BAD_REQUEST_ERROR = 400;
const UNAUTHORIZED_ERROR = 401;
const FORBIDDEN_ERROR = 403;
const NOT_FOUND_ERROR = 404;
const INTERNAL_SERVER_ERROR = 500;

const DEFAULT_RESPONSE = {
    error: false,
    data: null,
    errors: null,
    status_code: SUCCESS_REQUEST,
    message: null,
};

module.exports = {
    SUCCESS_REQUEST,
    BAD_REQUEST_ERROR,
    UNAUTHORIZED_ERROR,
    FORBIDDEN_ERROR,
    NOT_FOUND_ERROR,
    INTERNAL_SERVER_ERROR,
    DEFAULT_RESPONSE,
};
