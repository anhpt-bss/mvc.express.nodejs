const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Resource = require('@models/resource');
const constants = require('@config/constants');

class ResourceService {
    static uploadFiles(req, res, next) {
        return new Promise(async (resolve, reject) => {
            const { resource_category } = req.body;

            const uploadedFiles = [];
            for (const file of req.files) {
                const existingFile = await Resource.findOne({
                    filename: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                });

                if (existingFile) {
                    const existingFilePath = path.join(__dirname, `../../${existingFile.path}`);

                    if (fs.existsSync(existingFilePath)) {
                        // Existed old file: => Delete new file
                        fs.unlinkSync(file.path);

                        uploadedFiles.push(existingFile);
                    } else {
                        // Not existed old file: => Update new file path
                        const newResource = await Resource.findByIdAndUpdate(
                            existingFile._id,
                            { path: `${constants.UPLOADS_BASE_PATH}/${file.filename}` },
                            { new: true },
                        );

                        uploadedFiles.push(newResource);
                    }
                } else {
                    const newResource = new Resource({
                        filename: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype,
                        path: `${constants.UPLOADS_BASE_PATH}/${file.filename}`,
                        category: resource_category || null,
                    });
                    await newResource.save();
                    uploadedFiles.push(newResource);
                }
            }

            resolve(uploadedFiles);
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

    static checkExistingResource(req, res, next) {
        return new Promise(async (resolve, reject) => {
            const allResource = await Resource.find();
            const resourceNotExisted = [];

            for (const resource of allResource) {
                const existingFilePath = path.join(__dirname, `../../${resource.path}`);

                if (!fs.existsSync(existingFilePath)) {
                    resourceNotExisted.push(resource);
                }
            }

            resolve(resourceNotExisted);
        });
    }

    static getStaticFiles() {
        return new Promise((resolve, reject) => {
            const uploadDir = path.join(__dirname, `../../${constants.UPLOADS_BASE_PATH}`);
            fs.readdir(uploadDir, (error, files) => {
                if (error) {
                    console.log('[---Log---][---getStaticFiles---]: ', error);
                    return resolve([]);
                }
                return resolve(files);
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

    static generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    static async downloadFilesFromUrls(serverPath, urls) {
        const downloadDir = path.join(__dirname, `../../${constants.UPLOADS_BASE_PATH}`);

        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        const downloadedFiles = [];

        for (const url of urls) {
            const response = await axios.get(url, { responseType: 'stream' });
            const filename = `${this.generateRandomString(10)}-${path.basename(url)}`;
            const filePath = path.join(downloadDir, filename);

            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            downloadedFiles.push({
                old_path: url,
                new_path: `${serverPath}/${filename}`,
                filename,
                path: filePath,
                size: fs.statSync(filePath).size,
                mimetype: response.headers['content-type'],
            });
        }

        return downloadedFiles;
    }
}

module.exports = ResourceService;
