import express from "express";

import validateBody from "../decorators/validateBody.js";

import {
  registerSchema,
  loginSchema,
  userEmailSchema,
} from "../schemas/usersSchemas.js";

import authControllers from "../controllers/authControllers.js";
import contactsControllers from "../controllers/contactsControllers.js";

import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const { register, login, logout, getCurrent } = authControllers;
const { updateAvatar } = contactsControllers;

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), register);

authRouter.get("/verify/:verificationToken", authControllers.verify);

authRouter.post(
  "/verify",
  validateBody(userEmailSchema),
  authControllers.resendVerify
);

authRouter.post("/login", validateBody(loginSchema), login);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/logout", authenticate, logout);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  updateAvatar
);

export default authRouter;
