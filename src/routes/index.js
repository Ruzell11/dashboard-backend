// routes/userRoutes.js
const router = require("express").Router();
const createUserController = require("../controller/UserController");
const { validateToken } = require("../middleware");
const multer = require("multer");
const createProductController = require("../controller/ProductController");

// Wrap the router middleware in a function that returns the router
module.exports = () => {
  // Call the controller factory function with no parameters
  const {
    UserLogin,
    UserProfile,
    CreateTeamMembers,
    GetTeamMembers,
    EditUserDetails,
    DeleteUserDetails,
  } = createUserController();
  const { UploadProductDetails, GetProductList } = createProductController();

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  //public routes
  router.post("/login", UserLogin);

  //private routes
  router.get("/profile/:id", validateToken, UserProfile);
  router.post("/add-team", validateToken, CreateTeamMembers);
  router.get("/get-team-list/:id", validateToken, GetTeamMembers);
  router.patch("/edit-profile/:id", validateToken, EditUserDetails);
  router.delete("/delete-user", validateToken, DeleteUserDetails);
  router.post("/add-product/:id", upload.single("image"), UploadProductDetails);
  router.get("/get-product-list/", GetProductList);

  // Return the router with the middleware attached
  return router;
};
