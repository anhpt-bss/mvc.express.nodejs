const DynamicSchema = require('@models/dynamicSchema');
const { getDynamicModel, DynamicModels } = require('@models/dynamicModel');
const HttpResponse = require('@services/httpResponse');

/**
 * @swagger
 * tags:
 *   - name: DynamicModel
 *     description: CRUD for dynamic models and dynamic schemas
 *
 * components:
 *   schemas:
 *     DynamicSchema:
 *       type: object
 *       required:
 *         - modelName
 *         - schemaDefinition
 *       properties:
 *         modelName:
 *           type: string
 *           description: The name of the dynamic model
 *         schemaDefinition:
 *           type: object
 *           description: |
 *             The mongoose schema definition (JSON). Each property defines a field in the dynamic model, supporting all standard Mongoose schema field options, such as:
 *               - type: Data type of the field (e.g., string, number, boolean, date, array, object, etc.)
 *               - required: (boolean) Whether the field is required
 *               - default: (any) Default value if not provided
 *               - unique: (boolean) Whether the value must be unique
 *               - enum: (array) Allowed values
 *               - min, max, minlength, maxlength: (number) Value or length constraints
 *               - match: (regex) Regular expression validation
 *               - validate: (function/object) Custom validation
 *               - ref: (string) Reference to another model (for population)
 *             Example:
 *               schemaDefinition: {
 *                 name: { type: 'string', required: true },
 *                 email: { type: 'string', required: true, unique: true },
 *                 age: { type: 'number', min: 0 }
 *               }
 *         options:
 *           type: object
 *           description: |
 *             (Optional) Mongoose schema options. These configure schema-level behaviors, such as:
 *               - timestamps: (boolean) Automatically add createdAt and updatedAt fields
 *               - collection: (string) Specify the MongoDB collection name
 *               - strict: (boolean) Allow only fields defined in the schema
 *               - versionKey: (boolean|string) Enable/disable the __v version key
 *               - toJSON, toObject: (object) Customize output transformation
 *               - _id: (boolean) Enable/disable the _id field
 *               - autoIndex: (boolean) Automatically build indexes
 *               - minimize: (boolean) Remove empty objects
 *             Example:
 *               options: {
 *                 timestamps: true,
 *                 strict: false
 *               }
 *         created_time:
 *           type: string
 *           format: date-time
 *           description: The creation time
 *         updated_time:
 *           type: string
 *           format: date-time
 *           description: The last update time
 *       example:
 *         modelName: User
 *         schemaDefinition:
 *           name:
 *             type: string
 *             required: true
 *           email:
 *             type: string
 *             required: true
 *         options:
 *           timestamps: true
 *         created_time: 2024-07-15T00:00:00.000Z
 *         updated_time: 2024-07-15T00:00:00.000Z
 */

/**
 * @swagger
 * /api/dynamic/schemas:
 *   get:
 *     summary: List all dynamic schemas
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: header
 *         name: Accept
 *         required: false
 *         schema:
 *           type: string
 *         example: application/json
 *         description: Response content type
 *     responses:
 *       200:
 *         description: List of dynamic schemas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.getAllSchemas = async (req, res, next) => {
    
    try {
        const schemas = await DynamicSchema.find();
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, schemas);
        } else {
            res.locals.response = HttpResponse.successResponse(schemas);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getDynamicSchemas---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
/**
 * @swagger
 * /api/dynamic/schemas:
 *   post:
 *     summary: Create a new dynamic schema
 *     tags: [DynamicModel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DynamicSchema'
 *           example:
 *             modelName: User
 *             schemaDefinition:
 *               name:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *             options:
 *               timestamps: true
 *     responses:
 *       200:
 *         description: New dynamic schema created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DynamicSchema'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.createSchema = async (req, res, next) => {
    try {
        const { modelName, schemaDefinition, options } = req.body;
        // Check if model already exists in DynamicSchema
        const exists = await DynamicSchema.findOne({ modelName });
        if (exists) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], 'Dynamic schema with this modelName already exists');
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], 'Dynamic schema with this modelName already exists');
                return next();
            }
        }
        // Check if collection already exists in MongoDB (pluralize and lowercase)
        const pluralize = require('mongoose/lib/helpers/pluralize');
        const collectionName = pluralize(modelName).toLowerCase();
        const collections = await DynamicSchema.db.db.listCollections({ name: collectionName }).toArray();
        if (collections.length > 0) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], 'Collection with this modelName already exists');
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], 'Collection with this modelName already exists');
                return next();
            }
        }
        const schema = await DynamicSchema.create({ modelName, schemaDefinition, options });
        getDynamicModel(modelName, schemaDefinition, options);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, schema);
        } else {
            res.locals.response = HttpResponse.successResponse(schema);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---createDynamicSchema---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
/**
 * @swagger
 * /api/dynamic/schemas/{modelName}:
 *   put:
 *     summary: Update dynamic schema
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         schema:
 *           type: string
 *         required: true
 *         example: User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schemaDefinition:
 *                 type: object
 *               options:
 *                 type: object
 *               modelName:
 *                 type: string
 *           example:
 *             modelName: User
 *             schemaDefinition:
 *               name:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *             options:
 *               timestamps: true
 *     responses:
 *       200:
 *         description: Updated schema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.updateSchema = async (req, res, next) => {
    try {
        const { modelName } = req.params;
        const { schemaDefinition, options } = req.body;
        // Support changing modelName via req.body.modelName
        let targetModelName = req.body.modelName && req.body.modelName !== modelName ? req.body.modelName : modelName;
        if (targetModelName !== modelName) {
            // Check if model already exists in DynamicSchema
            const exists = await DynamicSchema.findOne({ modelName: targetModelName });
            if (exists) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return HttpResponse.badRequest(res, [], 'Dynamic schema with this modelName already exists');
                } else {
                    res.locals.response = HttpResponse.badRequestResponse([], 'Dynamic schema with this modelName already exists');
                    return next();
                }
            }
            // Check if collection already exists in MongoDB (pluralize and lowercase)
            const pluralize = require('mongoose/lib/helpers/pluralize');
            const collectionName = pluralize(targetModelName).toLowerCase();
            const collections = await DynamicSchema.db.db.listCollections({ name: collectionName }).toArray();
            if (collections.length > 0) {
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return HttpResponse.badRequest(res, [], 'Collection with this modelName already exists');
                } else {
                    res.locals.response = HttpResponse.badRequestResponse([], 'Collection with this modelName already exists');
                    return next();
                }
            }
        }
        // Update schema, including modelName if changed
        const updateFields = { schemaDefinition, options, updated_time: new Date() };
        if (targetModelName !== modelName) updateFields.modelName = targetModelName;
        const updated = await DynamicSchema.findOneAndUpdate(
            { modelName },
            updateFields,
            { new: true }
        );
        if (!updated) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        getDynamicModel(targetModelName, schemaDefinition, options);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, updated);
        } else {
            res.locals.response = HttpResponse.successResponse(updated);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateDynamicSchema---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
/**
 * @swagger
 * /api/dynamic/schemas/{modelName}:
 *   delete:
 *     summary: Delete dynamic schema
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         schema:
 *           type: string
 *         required: true
 *         example: User
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.deleteSchema = async (req, res, next) => {
    try {
        const { modelName } = req.params;
        await DynamicSchema.deleteOne({ modelName });
        delete DynamicModels[modelName];
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { success: true });
        } else {
            res.locals.response = HttpResponse.successResponse({ success: true });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteDynamicSchema---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

// --- Dynamic Model CRUD ---
/**
 * @swagger
 * /api/dynamic/{modelName}:
 *   get:
 *     summary: List all documents of a dynamic model
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         schema:
 *           type: string
 *         required: true
 *         example: User
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.getAllDynamic = async (req, res, next) => {
    try {
        const { modelName } = req.params;
        const config = await DynamicSchema.findOne({ modelName });
        if (!config) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        const Model = getDynamicModel(modelName, config.schemaDefinition, config.options);
        const items = await Model.find();
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, items);
        } else {
            res.locals.response = HttpResponse.successResponse(items);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getAllDynamic---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
/**
 * @swagger
 * /api/dynamic/{modelName}/{id}:
 *   get:
 *     summary: Get a document by id
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         schema:
 *           type: string
 *         required: true
 *         example: User
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         example: 665c1e2f1a2b3c4d5e6f7a8b
 *     responses:
 *       200:
 *         description: Document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.getDynamicById = async (req, res, next) => {
    try {
        const { modelName, id } = req.params;
        const config = await DynamicSchema.findOne({ modelName });
        if (!config) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        const Model = getDynamicModel(modelName, config.schemaDefinition, config.options);
        const item = await Model.findById(id);
        if (!item) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, item);
        } else {
            res.locals.response = HttpResponse.successResponse(item);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getDynamicById---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
/**
 * @swagger
 * /api/dynamic/{modelName}:
 *   post:
 *     summary: Create a document in a dynamic model
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         schema:
 *           type: string
 *         required: true
 *         example: User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             name: John Doe
 *             email: john@example.com
 *     responses:
 *       200:
 *         description: Created document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.createDynamic = async (req, res, next) => {
    try {
        const { modelName } = req.params;
        const config = await DynamicSchema.findOne({ modelName });
        if (!config) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        const Model = getDynamicModel(modelName, config.schemaDefinition, config.options);
        const item = await Model.create(req.body);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, item);
        } else {
            res.locals.response = HttpResponse.successResponse(item);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---createDynamic---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
/**
 * @swagger
 * /api/dynamic/{modelName}/{id}:
 *   put:
 *     summary: Update a document by id
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         schema:
 *           type: string
 *         required: true
 *         example: User
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         example: 665c1e2f1a2b3c4d5e6f7a8b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             name: John Doe
 *             email: john@example.com
 *     responses:
 *       200:
 *         description: Updated document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.updateDynamic = async (req, res, next) => {
    try {
        const { modelName, id } = req.params;
        const config = await DynamicSchema.findOne({ modelName });
        if (!config) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        const Model = getDynamicModel(modelName, config.schemaDefinition, config.options);
        const item = await Model.findByIdAndUpdate(id, req.body, { new: true });
        if (!item) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, item);
        } else {
            res.locals.response = HttpResponse.successResponse(item);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateDynamic---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
/**
 * @swagger
 * /api/dynamic/{modelName}/{id}:
 *   delete:
 *     summary: Delete a document by id
 *     tags: [DynamicModel]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         schema:
 *           type: string
 *         required: true
 *         example: User
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         example: 665c1e2f1a2b3c4d5e6f7a8b
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Access forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
exports.deleteDynamic = async (req, res, next) => {
    try {
        const { modelName, id } = req.params;
        const config = await DynamicSchema.findOne({ modelName });
        if (!config) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.notFound(res);
            } else {
                res.locals.response = HttpResponse.notFoundResponse();
                return next();
            }
        }
        const Model = getDynamicModel(modelName, config.schemaDefinition, config.options);
        await Model.findByIdAndDelete(id);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { success: true });
        } else {
            res.locals.response = HttpResponse.successResponse({ success: true });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteDynamic---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
