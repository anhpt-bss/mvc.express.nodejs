const express = require('express');
const router = express.Router();
const {
    getAllSchemas,
    createSchema,
    updateSchema,
    deleteSchema,
    getAllDynamic,
    getDynamicById,
    createDynamic,
    updateDynamic,
    deleteDynamic
} = require('@controllers/dynamicModel');

// CRUD for dynamic schemas
router.get('/schemas', getAllSchemas);
router.post('/schemas', createSchema);
router.put('/schemas/:modelName', updateSchema);
router.delete('/schemas/:modelName', deleteSchema);

// CRUD for dynamic models
router.get('/:modelName', getAllDynamic);
router.get('/:modelName/:id', getDynamicById);
router.post('/:modelName', createDynamic);
router.put('/:modelName/:id', updateDynamic);
router.delete('/:modelName/:id', deleteDynamic);

module.exports = router;
