const pushNotification = (res, type, response) => {
    switch (type) {
    case 'success':
        res.cookie(
            'notification',
            {
                type: 'success',
                title: response.message,
                content: null,
                errors: null,
            },
            { httpOnly: true },
        );
        break;

    case 'error':
        res.cookie(
            'notification',
            {
                type: 'error',
                title: response.message,
                content: null,
                errors: response.errors,
            },
            { httpOnly: true },
        );
        break;

    case 'warning':
        res.cookie(
            'notification',
            {
                type: 'warning',
                title: response.message,
                content: null,
                errors: response.errors,
            },
            { httpOnly: true },
        );
        break;

    default:
        break;
    }
};

module.exports = { pushNotification };
