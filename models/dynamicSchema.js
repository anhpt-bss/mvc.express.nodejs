const mongoose = require('mongoose');

const dynamicSchemaConfig = new mongoose.Schema({
    modelName: { type: String, required: true, unique: true },
    schemaDefinition: { type: Object, required: true },
    options: { type: Object, required: false },
    created_time: { type: Date, default: Date.now },
    updated_time: { type: Date, default: Date.now },
});

dynamicSchemaConfig.index({ modelName: 1 });

module.exports = mongoose.model('DynamicSchema', dynamicSchemaConfig);
