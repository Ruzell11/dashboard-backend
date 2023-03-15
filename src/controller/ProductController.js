const {
  HTTP_OK,
  SUCCESS,
  HTTP_BAD_REQUEST,
  FAILED,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../global");
const Product = require("../model/ProductModel");
const cloudinary = require("../db/cloudinary");
const TeamMember = require("../model/CreateTeamModel");
const ProductModel = require("../model/ProductModel");

const createProductController = () => {
  const UploadProductDetails = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { product_name, product_price, product_description } = req.body;
      const imageBuffer = req.file.buffer;

      if (
        !id ||
        !product_name ||
        !product_price ||
        !product_description ||
        !imageBuffer
      ) {
        return res.status(HTTP_BAD_REQUEST).json({
          success: FAILED,
          message: "Missing Fields are required",
        });
      }

      const result = await cloudinary.uploader.upload(imageBuffer, {
        folder: "my_folder",
        tags: ["my_tag"],
        public_id: product_name,
      });

      const newProduct = new Product({
        created_by: id,
        product_price,
        product_description,
        product_name,
        image_link: result.secure_url,
      });

      newProduct.save();

      res.status(HTTP_OK).json({
        success: SUCCESS,
        message: "Product Successfully Uploaded",
      });
      // ...
    } catch (err) {
      const error = new Error(err);
      next(error);
    }
  };

  const GetProductList = async (req, res, next) => {
    const { user_id, role_id } = req.query;

    if (!user_id || !role_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Missing Fields are required" });
    }

    let productListQuery = {};
    let populateOptions = null;

    if (role_id === "1") {
      productListQuery = {}; // get all products
      populateOptions = { path: "created_by", select: "username" }; // include username of created_by in response
    } else {
      const user = await TeamMember.findById(user_id);
      if (!user) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "User does not exist" });
      }
      productListQuery = { created_by: user_id }; // get products created by user
    }

    try {
      const productList = await ProductModel.find(productListQuery)
        .populate(populateOptions)
        .exec();

      if (productList.length === 0) {
        return res
          .status(HTTP_OK)
          .json({ success: SUCCESS, message: "No products found" });
      }

      // Update created_by field to created_by_username as a string
      const productListResponse = productList.map((product) => ({
        ...product,
        created_by: product.created_by._id,
        created_by_username: product.created_by.username,
      }));

      return res.status(HTTP_OK).json({
        success: SUCCESS,
        message: "List of products",
        productList: productListResponse,
      });
    } catch (err) {
      const error = new Error(err);
      next(error);
    }
  };

  const GetSingleProductDetails = async (req, res, next) => {
    const { id } = req.params;
    try {
      if (!id) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "Id is required" });
      }

      const productDetails = await Product.findById(id);

      if (productDetails.length === null) {
        return res
          .status(HTTP_OK)
          .json({ success: SUCCESS, message: "Product not found" });
      }

      const createdByUsername = await TeamMember.findById(
        productDetails.created_by
      );

      res.status(HTTP_OK).json({
        success: SUCCESS,
        message: "Product details found",
        created_by_username: createdByUsername.username,
        productDetails,
      });
    } catch (err) {
      const error = new Error(err);
      next(error);
    }
  };

  return { UploadProductDetails, GetProductList, GetSingleProductDetails };
};

module.exports = createProductController;
