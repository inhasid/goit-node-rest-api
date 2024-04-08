import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";

import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

import * as authServices from "../services/authServices.js";

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email, { protocol: "https", d: "identicon" });

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await authServices.register({
    ...req.body,
    avatarURL,
    password: hashPassword,
  });
  if (!newUser) {
    throw HttpError(404, "Not found");
  }
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await authServices.updateUser({ _id: id }, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription, avatarURL } = req.user;
  res.json({ email, subscription, avatarURL });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { token: "" });
  res.status(204).json({
    message: "No Content",
  });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};
