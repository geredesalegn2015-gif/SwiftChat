// handlerFactory.js
// ------------------------------
// Generic CRUD factory functions like Jonas's Natours project
// Each function returns a controller for a specific model
// ------------------------------

import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// DELETE one document by ID
export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(204).json({ status: "success", data: null });
  });

// UPDATE one document by ID
export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated document
      runValidators: true, // enforce schema validators
    });
    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(200).json({ status: "success", data: doc });
  });

// CREATE one document
export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: doc });
  });

// GET one document by ID, optionally populate references
export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;
    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(200).json({ status: "success", data: doc });
  });

// GET all documents
export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.find();
    res.status(200).json({ status: "success", results: docs.length, data: docs });
  });
