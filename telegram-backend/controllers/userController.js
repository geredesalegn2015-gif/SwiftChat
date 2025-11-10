import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { getAll, getOne, updateOne, deleteOne } from "./handlerFactory.js";

// Filter object to allow only specific fields to be updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get own user data
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Update current user data (name, email, photo)
export const updateMe = catchAsync(async (req, res, next) => {
  // 1️⃣ Prevent password updates here
  if (req.body.password)
    return next(new AppError("Use /updateMyPassword to update password.", 400));

  // 2️⃣ Filter allowed fields
  const filteredBody = filterObj(req.body, "fullName", "email");
  if (req.file) filteredBody.profilePic = req.file.filename;

  // 3️⃣ Update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  }).select("-password");

  // 4️⃣ Respond
  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

export const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(204).json({ status: "success", data: null });
});

export const searchUsers =catchAsync(async (req, res) => {
  const query = req.query.q || "";
  const regex = new RegExp(query, "i");

  const users = await User.find({ fullName: { $regex: regex } })
    .select("_id fullName email");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});
// Admin CRUD
export const getUser = getOne(User);
export const getAllUsers = getAll(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
