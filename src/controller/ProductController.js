const { HTTP_OK } = require('../global');
const Product = require('../model/ProductModel');

const createProductController = () => {


    const UploadProductDetails = async (req, res) => {

        try {
            const { name, description, price } = req.body;

            const imageName = req.file.originalname;
            const imageData = req.file.buffer;
            const contentType = req.file.mimetype;

            const newProduct = await new Product({
                name: imageName,
                data: imageData,
                contentType: contentType
            })

            const savedProduct = await newProduct.save();

            res.json({ message: 'Product created successfully', product: savedProduct });
        } catch (error) {
            console.log(error)
        }
    }
    const GetProductDetails = async (req, res) => {
        const id = req.params.id;
        try {
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(HTTP_OK).json({ product })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    return { UploadProductDetails, GetProductDetails }
}

module.exports = createProductController;