const express = require("express");
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { checkProfileOwner } = require("../middleware/checkProfileOwner");

const userRouter = express.Router();

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id", userController.getUserProfile);
userRouter.put("/updateProfile/:id", authenticateToken, checkProfileOwner, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", authenticateToken, checkProfileOwner, userController.deleteUserProfile);

module.exports = userRouter;