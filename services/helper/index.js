const moment = require('moment');
const _ = require('lodash');
const constants = require('@config/constants');
const { paymentMethod, paymentStatus, orderStatus } = require('@models/enum');

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
        return price - price * (discount / 100);
    },
    addCommasToNumber: function (number) {
        const convertNumber = number > 0 ? number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : number;

        return convertNumber + '₫';
    },
    formatDateTime: function (dateString) {
        return dateString ? moment(dateString).format('DD/MM/YYYY • HH:mm:ss') : '';
    },
    getDaysFromNow: function (dateString) {
        return dateString ? moment(dateString).fromNow() : '';
    },
    renderDatetime: function (dateString) {
        return moment(new Date()).diff(moment(dateString), 'days') > 10
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
        return !_.isEmpty(avatar) ? `${constants.SERVER_URL}/${avatar}` : '/assets/images/default-avatar.jpg';
    },
    getKeyLabel: (key, value) => {
        switch (key) {
            case 'payment_status':
                return paymentStatus?.find((item) => item?.value === value)?.label || value;

            case 'payment_method':
                return paymentMethod?.find((item) => item?.value === value)?.label || value;

            case 'order_status':
                return orderStatus?.find((item) => item?.value === value)?.label || value;

            default:
                return value;
        }
    },
    renderKeyLabel: (key, value) => {
        switch (key) {
            case 'payment_status':
                const status = paymentStatus.find((item) => item.value === value);
                return `<div style="color: ${status ? status.color : ''};">${status ? status.label : value}</div>`;

            case 'payment_method':
                const method = paymentMethod.find((item) => item.value === value);
                return `<div style="color: ${method ? method.color : ''};">${method ? method.label : value}</div>`;

            case 'order_status':
                const order = orderStatus.find((item) => item.value === value);
                return `<div style="color: ${order ? order.color : ''};">${order ? order.label : value}</div>`;

            default:
                return value;
        }
    },
};

module.exports = { pushNotification, helper };
