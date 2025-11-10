import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// Helper: sign a JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper: create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

// 🔹 Sign up new user
export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
  });
  createSendToken(newUser, 201, res);
});

// 🔹 Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1️⃣ Check if email and password exist
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  // 2️⃣ Find user and select password field
  const user = await User.findOne({ email }).select("+password");

  // 3️⃣ Check credentials
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  // 4️⃣ Send token to client
  createSendToken(user, 200, res);
});

// 🔹 Protect routes middleware
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1️⃣ Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
    token = req.headers.authorization.split(" ")[1];
  if (!token)
    return next(new AppError("You are not logged in! Please log in to get access.", 401));

  // 2️⃣ Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3️⃣ Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("The user belonging to this token no longer exists.", 401));

  // 4️⃣ Grant access
  req.user = currentUser;
  next();
});

// 🔹 Logout user
export const logout = (req, res) => {
  // 1️⃣ Overwrite token with 'loggedout' and expire immediately
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true, // prevents client-side JS access
  });

  // 2️⃣ Send response
  res.status(200).json({ status: "success" });
};
