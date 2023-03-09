// routes/userRoutes.js
const router = require("express").Router();
const createUserController = require("../controller/index");
const { validateToken } = require("../middleware");

// Wrap the router middleware in a function that returns the router
module.exports = () => {
  // Call the controller factory function with no parameters
  const { UserLogin, UserRegister, UserProfile } = createUserController();

  //public routes
  router.post("/login", UserLogin);
  router.post("/register", UserRegister);

  //private routes

  router.get("/profile", validateToken, UserProfile);

  // Return the router with the middleware attached
  return router;
};