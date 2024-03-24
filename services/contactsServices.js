import Contact from "../models/Contact.js";
// import fs from "fs/promises";
// import path from "path";
// import { nanoid } from "nanoid";

export const listContacts = () => Contact.find({}, "-createdAt -updatedAt");

export const getContactById = (id) => Contact.findById(id);

export const removeContact = (id) => Contact.findByIdAndDelete(id);

export const addContact = (data) => Contact.create(data);

export const updateContact = (id, data) => Contact.findByIdAndUpdate(id, data);

export const updateStatusById = (id, data) =>
  Contact.findByIdAndUpdate(id, data);
