const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
//TODO: make get coords work with google api as well. atm only with mapbox
const getCoordsForAddress = require("../utils/location");
const mongoose = require("mongoose");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  console.log(placeId);
  try {
    place = await Place.findById(placeId).exec();
  } catch (err) {
    const error = new HttpError(err.message, err.code, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  if (!place) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("Place not found", 404));
  }
  res.json({
    message: "Found",
    placeId,
    places: places.map(place => place.toObject({ getters: true })),
  });
};

const getPlacesByUserId = async (req, res, next) => {
  const uid = req.params.uid;
  // check if we have any users with that uid
  let places;
  try {
    places = await Place.find({ creator: uid }).exec();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  if (!places || places.length === 0) {
    // throw new HttpError("User Not Found innit! blood", 404);
    return next(new HttpError("User not found", 404));
  }
  res.json({
    uid,
    count: places.length,
    places: places.map(place => place.toObject({ getters: true })),
  });
};

const updatePlaceById = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    res.status(422);
    res.json(validationErrors.mapped());
    return;
  }

  const { title, description, coordinates, address } = req.body;
  const pid = req.params.pid;

  let place;

  try {
    place = await Place.findById(pid).exec();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  if (!place) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("Place not found", 404));
  }

  if (title) place.title = title;
  if (description) place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  res.status(200);
  res.json({ place: place.toObject({ getters: true }) });
};
const deletePlaceById = async (req, res, next) => {
  const pid = req.params.pid;
  // check if we have any users with that uid
  let place;

  try {
    place = await Place.findById(pid).exec();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  if (!place) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("Place not found", 404));
  }
  // return updated places array
  try {
    await place.remove();
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }
  res.status(200);
  res.json({ message: "deleted", pid, place: place.toObject({ getters: true }) });
};

const createNewPlace = async (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    res.status(422);
    res.json(validationErrors.mapped());
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    imageUrl: "https://picsum.photos/200/300",
    address,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  if (!user) {
    return next(new HttpError("Couldnt find user for the provided id", 500));
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace); // mongoose push not usual push
    console.log(user);
    await user.save({ session: sess });
    await sess.commitTransaction(); // only at this stage do we save to db
    // make sure that DB has the collections, commitTransaction wont create it automatically
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  // dummyPlaces.push(createdPlace); // can use unshift

  res.status(201).json({ place: createdPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createNewPlace = createNewPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
