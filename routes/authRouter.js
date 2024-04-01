import express from "express";

import validateBody from "../decorators/validateBody.js";

import { registerSchema, loginSchema } from "../schemas/usersSchemas.js";

import authControllers from "../controllers/authControllers.js";
import authenticate from "../middlewares/authenticate.js";

const { register, login, logout, getCurrent } = authControllers;

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), register);

authRouter.post("/login", validateBody(loginSchema), login);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/logout", authenticate, logout);

export default authRouter;
