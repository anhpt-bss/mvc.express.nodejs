const mongoose = require('mongoose');
const DynamicSchema = require('@models/dynamicSchema');

// Store for dynamic models
const DynamicModels = {};

/**
 * Get or create a dynamic mongoose model from config
 * @param {String} modelName
 * @param {Object} schemaDefinition
 * @param {Object} [options]
 * @returns {mongoose.Model}
 */
function getDynamicModel(modelName, schemaDefinition, options = {}) {
    if (DynamicModels[modelName]) return DynamicModels[modelName];
    if (mongoose.models[modelName]) {
        DynamicModels[modelName] = mongoose.model(modelName);
        return DynamicModels[modelName];
    }
    const schema = new mongoose.Schema(schemaDefinition, options);
    DynamicModels[modelName] = mongoose.model(modelName, schema);
    return DynamicModels[modelName];
}

/**
 * Load all dynamic schemas from DB and register models
 */
async function loadAllDynamicModels() {
    const configs = await DynamicSchema.find();
    configs.forEach(cfg => {
        console.log('[---Log---][---App---]: ', `Loading dynamic model: ${cfg.modelName}`);
        getDynamicModel(cfg.modelName, cfg.schemaDefinition, cfg.options);
    });
}

module.exports = {
    getDynamicModel,
    loadAllDynamicModels,
    DynamicModels,
};
