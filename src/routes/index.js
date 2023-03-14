// routes/userRoutes.js
const router = require("express").Router();
const userController = require("../controller/UserController");
const { validateToken } = require("../middleware");
const multer = require("multer");
const createProductController = require("../controller/ProductController");

// Wrap the router middleware in a function that returns the router
module.exports = () => {
  // Call the controller factory function with no parameters
  const {
    loginUser,
    userProfile,
    createTeamMembers,
    getTeamMembers,
    editUserDetails,
    deleteUserDetails,
  } = userController();
  const { UploadProductDetails, GetProductList, GetSingleProductDetails } =
    createProductController();

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  //public routes
  router.post("/login", loginUser);

  //private routes
  router.get("/profile/:id", validateToken, userProfile);
  router.post("/add-team", validateToken, createTeamMembers);
  router.get("/get-team-list/:id", validateToken, getTeamMembers);
  router.patch("/edit-profile/:id", validateToken, editUserDetails);
  router.delete("/delete-user", validateToken, deleteUserDetails);
  router.post(
    "/add-product/:id",
    upload.single("image"),
    validateToken,
    UploadProductDetails
  );
  router.get("/get-product-list/", validateToken, GetProductList);
  router.get("/get-single-product/:id", validateToken, GetSingleProductDetails);

  // Return the router with the middleware attached
  return router;
};
