var moment = require('moment');

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

    case 'info':
        res.cookie(
            'notification',
            {
                type: 'info',
                title: response.title || null,
                content: response.content || null,
                errors: null,
            },
            { httpOnly: true },
        );
        break;

    default:
        break;
    }
};

const helper = {
    calcPrice: function (price, discount) {
        return (price - (price * (discount / 100)));
    },
    addCommasToNumber: function (number) {
        const convertNumber =
        number > 0
            ? number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : number;

        return convertNumber + '₫';
    },
    formatDateTime: function (dateString) {
        return dateString ? moment(dateString).format('DD/MM/YYYY • HH:mm:ss') : '';
    },
    getDaysFromNow: function (dateString) {
        return dateString ? moment(dateString).fromNow() : '';
    },
    renderDatetime: function (dateString) {
        return  moment(new Date()).diff(moment(dateString), 'days') > 10
            ? moment(dateString).format('DD/MM/YYYY • HH:mm:ss')
            : moment(dateString).fromNow();
    },
    removeAccents: function (str) {
        const AccentsMap = [
            'aàảãáạăằẳẵắặâầẩẫấậ',
            'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
            'dđ',
            'DĐ',
            'eèẻẽéẹêềểễếệ',
            'EÈẺẼÉẸÊỀỂỄẾỆ',
            'iìỉĩíị',
            'IÌỈĨÍỊ',
            'oòỏõóọôồổỗốộơờởỡớợ',
            'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
            'uùủũúụưừửữứự',
            'UÙỦŨÚỤƯỪỬỮỨỰ',
            'yỳỷỹýỵ',
            'YỲỶỸÝỴ',
        ];
        for (let i = 0; i < AccentsMap.length; i++) {
            const re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
            const char = AccentsMap[i][0];
            str = str.replace(re, char);
        }
        return str;
    },
    getAvatar: function (avatar) {
        return avatar ? avatar : '/images/default-avatar.jpg';
    },
    getPaymentMethod: (method) => {
        if(method === 'cash') {
            return 'Tiền mặt';
        } else if(method === 'cards') {
            return 'Thẻ ngân hàng/Thẻ tín dụng';
        } else if(method === 'bank_transfer') {
            return 'Chuyển Khoản ngân hàng';
        } else {
            return method;
        }
    },
    getPaymentStatus: (status) => {
        if(status === 'unpaid') {
            return 'Chưa thanh toán';
        } else if(status === 'paid') {
            return 'Đã thanh toán';
        } else {
            return status;
        }
    }
};

module.exports = { pushNotification, helper };
