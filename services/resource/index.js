const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Resource = require('@models/resource');
const constants = require('@config/constants');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, `../../${constants.UPLOADS_BASE_PATH}`);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
}).array('files', 10); // Maximum 10 files

class ResourceService {
    static uploadFiles(req, res, next) {
        return new Promise((resolve, reject) => {
            upload(req, res, async (err) => {
                if (err) {
                    return reject(err);
                }

                const uploadedFiles = [];
                for (const file of req.files) {
                    const existingFile = await Resource.findOne({ filename: file.originalname, size: file.size, mimetype: file.mimetype });
                    if (existingFile) {
                        uploadedFiles.push(existingFile);
                    } else {
                        const newResource = new Resource({
                            filename: file.originalname,
                            size: file.size,
                            mimetype: file.mimetype,
                            path: `${constants.UPLOADS_BASE_PATH}/${file.filename}`,
                        });
                        await newResource.save();
                        uploadedFiles.push(newResource);
                    }
                }

                resolve(uploadedFiles);
            });
        });
    }

    static async deleteFile(fileId) {
        const resource = await Resource.findById(fileId);
        if (resource) {
            const filePath = path.join(__dirname, `../../${resource.path}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                await Resource.deleteOne({ _id: fileId });
                return true;
            }
            throw new Error('File not found');
        }
        throw new Error('Resource not found');
    }    
    
    static getStaticFiles() {
        return new Promise((resolve, reject) => {
            const uploadDir = path.join(__dirname, `../../${constants.UPLOADS_BASE_PATH}`);
            fs.readdir(uploadDir, (err, files) => {
                if (err) {
                    return reject(err);
                }
                resolve(files);
            });
        });
    }

    static deleteStaticFiles(filePath) {
        return new Promise((resolve, reject) => {
            const uploadDir = path.join(__dirname, `../../${constants.UPLOADS_BASE_PATH}`);
            
            if (!filePath) {
                // If no file path is provided, delete all files
                fs.readdir(uploadDir, (err, files) => {
                    if (err) {
                        return reject(err);
                    }
                    for (const file of files) {
                        fs.unlinkSync(path.join(uploadDir, file));
                    }
                    resolve('All files deleted successfully');
                });
            } else {
                // Delete specific file
                const fileToDelete = path.join(uploadDir, path.basename(filePath));
                fs.unlink(fileToDelete, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve('File deleted successfully');
                });
            }
        });
    }
}

module.exports = ResourceService;
