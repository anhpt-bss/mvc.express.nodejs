const multer = require('multer');
const fs = require('fs');
const path = require('path');
const constants = require('@config/constants');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(
            __dirname,
            `../${constants.UPLOADS_BASE_PATH}`,
        );
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = () =>
    multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (req, file, cb) => {
            const allowedMimeTypes = [
                'image/jpeg',
                'image/png',
                'application/pdf',
                'image/gif',
                'image/webp',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip',
                'application/x-rar-compressed',
                'application/x-7z-compressed',
                'audio/mpeg',
                'audio/wav',
                'video/mp4',
                'video/x-msvideo',
                'video/x-matroska',
            ];
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type'));
            }
        },
    }).array('files', 10); // Maximum 10 files

module.exports = { storage, upload };
