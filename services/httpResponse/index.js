const {
    SUCCESS_REQUEST,
    BAD_REQUEST_ERROR,
    UNAUTHORIZED_ERROR,
    FORBIDDEN_ERROR,
    NOT_FOUND_ERROR,
    INTERNAL_SERVER_ERROR,
} = require('./constants');
const i18next = require('i18next');

class HttpResponse {
    static successResponse(data = {}, message = i18next.t('common.request_successfully')) {
        return {
            error: false,
            data,
            errors: null,
            status_code: SUCCESS_REQUEST,
            message,
        };
    }

    static badRequestResponse(errors = [], message = i18next.t('common.bad_request')) {
        return {
            error: true,
            data: null,
            errors,
            status_code: BAD_REQUEST_ERROR,
            message,
        };
    }

    static unauthorizedResponse(errors = [], message = i18next.t('common.unauthorized_access')) {
        return {
            error: true,
            data: null,
            errors,
            status_code: UNAUTHORIZED_ERROR,
            message,
        };
    }

    static forbiddenResponse(errors = [], message = i18next.t('common.access_forbidden')) {
        return {
            error: true,
            data: null,
            errors,
            status_code: FORBIDDEN_ERROR,
            message,
        };
    }

    static notFoundResponse(errors = [], message = i18next.t('common.resource_not_found')) {
        return {
            error: true,
            data: null,
            errors,
            status_code: NOT_FOUND_ERROR,
            message,
        };
    }

    static internalServerErrorResponse(errors = [], message = i18next.t('common.internal_server_error')) {
        return {
            error: true,
            data: null,
            errors,
            status_code: INTERNAL_SERVER_ERROR,
            message,
        };
    }

    static success(res, data, message) {
        res.status(SUCCESS_REQUEST).json(this.successResponse(data, message));
    }

    static badRequest(res, errors, message) {
        res.status(BAD_REQUEST_ERROR).json(this.badRequestResponse(errors, message));
    }

    static unauthorized(res, errors, message) {
        res.status(UNAUTHORIZED_ERROR).json(this.unauthorizedResponse(errors, message));
    }

    static forbidden(res, errors, message) {
        res.status(FORBIDDEN_ERROR).json(this.forbiddenResponse(errors, message));
    }

    static notFound(res, errors, message) {
        res.status(NOT_FOUND_ERROR).json(this.notFoundResponse(errors, message));
    }

    static internalServerError(res, errors, message) {
        res.status(INTERNAL_SERVER_ERROR).json(this.internalServerErrorResponse(errors, message));
    }
}

module.exports = HttpResponse;
