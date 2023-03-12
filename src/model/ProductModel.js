const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    data: {
        type: Buffer,
        required: true
    },
    contentType: {
        type: String,
        required: true
    }
});

// Create a model for your image
const ProductModel = mongoose.model('Product', ProductSchema);


module.exports = ProductModel;