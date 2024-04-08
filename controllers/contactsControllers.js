import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";

import * as contactsService from "../services/contactsServices.js";

import User from "../models/User.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

import HttpError from "../helpers/HttpError.js";

const avatarPath = path.resolve("public", "avatars");

const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;

  const { page = 1, limit = 20, favorite } = req.query;
  const skip = (page - 1) * limit;
  const filter = favorite ? { $and: [{ owner }, { favorite }] } : { owner };

  const result = await contactsService.listContacts(filter, { skip, limit });
  const total = await contactsService.countContacts({ owner });
  if (!result) {
    throw HttpError(404, `Contacts not found`);
  }
  res.json({
    result,
    total,
  });
};

const getOneContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await contactsService.getContactById({ owner, _id: id });
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }

  res.status(200).json(result);
};

const deleteContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await contactsService.removeContact({ owner, _id: id });
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }

  res.status(200).json(result);
};

const createContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarPath, filename);
  await fs.rename(oldPath, newPath);
  const avatar = path.join("avatars", filename);
  const result = await contactsService.addContact({
    ...req.body,
    avatar,
    owner,
  });
  if (!result) {
    throw HttpError(400);
  }
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await contactsService.updateContact(
    { owner, _id: id },
    req.body
  );
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }

  res.status(200).json(result);
};

const updateStatusContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const favoredContact = await contactsService.updateStatusById(
    { owner, _id: id },
    req.body,
    {
      new: true,
    }
  );
  if (!favoredContact) {
    throw HttpError(404);
  }
  res.status(200).json(favoredContact);
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "No file uploaded");
  }

  const { _id, email } = req.user;
  const { path: oldPath, filename } = req.file;

  Jimp.read(oldPath, (err, img) => {
    if (err) throw err;
    img.resize(250, 250).quality(60).greyscale().write(newPath);
  });

  const newFilename = `${email}_${filename}`;
  const newPath = path.join(avatarPath, newFilename);
  await fs.rename(oldPath, newPath);
  const avatarURL = path.join("avatars", newFilename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({ avatarURL });
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  deleteContact: ctrlWrapper(deleteContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  updateAvatar: ctrlWrapper(updateAvatar),
};
