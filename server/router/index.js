import { Router } from "express";
import UserController from "../controllers/user-controller.js";
const router = Router();
import { body } from "express-validator";
import authMiddleware from "../middlewares/auth-middleware.js";

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 12 }),
  UserController.registration
);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.get("/activate/:link", UserController.activate);
router.get("/refresh", UserController.refresh);
router.get("/users", authMiddleware, UserController.getUsers);

export default router;
