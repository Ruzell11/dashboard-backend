const { HTTP_OK, SUCCESS, HTTP_BAD_REQUEST, FAILED } = require("../global");
const Product = require("../model/ProductModel");
const cloudinary = require("../db/cloudinary");
const { UploadStream } = require("cloudinary");
const TeamMember = require("../model/CreateTeamModel");
const ProductModel = require("../model/ProductModel");

const createProductController = () => {
  const UploadProductDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const { product_name, product_price, product_description } = req.body;
      const imageString = req.file.buffer.toString("base64");

      if (
        !id ||
        !product_name ||
        !product_price ||
        !product_description ||
        !imageString
      ) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "Missing Fields are required" });
      }

      const result = await cloudinary.uploader.upload(
        "data:image/png;base64," + imageString,
        { folder: "my_folder", tags: ["my_tag"], public_id: product_name }
      );

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
    } catch (error) {
      console.log(error);
      res.status(500).send("Error uploading image to Cloudinary");
    }
  };
  const GetProductList = async (req, res) => {
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
        .lean()
        .exec();

      if (productList.length === 0) {
        return res
          .status(HTTP_OK)
          .json({ success: SUCCESS, message: "No products found" });
      }

      // Update created_by field to created_by_username as a string
      const productListResponse = productList.map((product) => ({
        ...product,
        created_by: product.created_by.username,
      }));

      return res.status(HTTP_OK).json({
        success: SUCCESS,
        message: "List of products",
        productList: productListResponse,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Internal Server Error" });
    }
  };

  return { UploadProductDetails, GetProductList };
};

module.exports = createProductController;
