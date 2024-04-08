import User from "../models/User.js";

export const findUser = (filter) => User.findOne(filter);

export const register = (data) => User.create(data);

export const updateUser = (filter, data) => User.findOneAndUpdate(filter, data);

export const updateSubscription = (filter, data) =>
  User.findOneAndUpdate(filter, data);
