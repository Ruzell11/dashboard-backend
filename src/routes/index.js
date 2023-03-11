// routes/userRoutes.js
const router = require("express").Router();
const createUserController = require("../controller/index");
const { validateToken } = require("../middleware");

// Wrap the router middleware in a function that returns the router
module.exports = () => {
  // Call the controller factory function with no parameters
  const { UserLogin, UserProfile, CreateTeamMembers, GetTeamMembers } =
    createUserController();

  //public routes
  router.post("/login", UserLogin);


  //private routes
  router.get("/profile/:id", validateToken, UserProfile);
  router.post("/add-team/:id", validateToken, CreateTeamMembers);
  router.get('/get-team-list/:id', validateToken, GetTeamMembers)

  // Return the router with the middleware attached
  return router;
};
