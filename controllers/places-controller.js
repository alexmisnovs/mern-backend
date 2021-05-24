const HttpError = require("../models/http-error");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
//TODO: make get coords work with google api as well. atm only with mapbox
const getCoordsForAddress = require("../utils/location");
const mongoose = require("mongoose");

const { cloudinary } = require("../services/cloudinary");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  console.log(placeId);
  try {
    place = await Place.findById(placeId);
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
  res.json({
    message: "Found",
    placeId,
    place: place.toObject({ getters: true }),
  });
};

const findPlacesByCity = async (req, res, next) => {
  const searchText = req.params.city;
  // const { city } = req.body;
  // since I got a form, I could still use query string
  let places;

  try {
    places = await Place.find({ $text: { $search: searchText } });
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  if (!places) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("No playgounds found", 404));
  }
  res.json({
    message: "Found",
    places: places.map(place => place.toObject({ getters: true })),
  });
};

const getPlacesByUserId = async (req, res, next) => {
  const uid = req.params.uid;
  // check if we have any users with that uid
  let userWithPlaces;
  try {
    // places = await Place.find({ creator: uid });
    //we could do this with populate method on the user model
    userWithPlaces = await User.findById(uid).populate("places");
  } catch (err) {
    if (err.kind === "ObjectId") return next(new HttpError(err.reason, 500)); // wrong user ID length
    console.log(err);
    return next(new HttpError("Couldn't find places", 500));
  }
  if (!userWithPlaces) {
    // throw new HttpError("User Not Found innit! blood", 404);
    return next(new HttpError("User not found", 404));
  }
  if (userWithPlaces.places.length === 0) {
    return next(new HttpError("This user has no places yet.", 404));
  }
  res.json({
    uid,
    count: userWithPlaces.places.length,
    places: userWithPlaces.places.map(place => place.toObject({ getters: true })),
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

  const { title, description, address, city } = req.body;
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
  // make sure that user ownes this place.. innit blood..
  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You dont OWN this place..", 401));
  }

  if (title) place.title = title;
  if (description) place.description = description;
  if (city) place.city = city;
  // if address actually changed, if not do not send request
  if (address && place.address !== address) {
    place.address = address;
    // we only do request if we have had any changes
    console.log("address changed, calling for new coords");
    let coordinates;
    try {
      coordinates = await getCoordsForAddress(address);
    } catch (error) {
      return next(error);
    }
    place.location = coordinates;
  }

  //TODO add address to the update and coordinates

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
    place = await Place.findById(pid).populate("creator");
    // populate allows to refer to the other collection. populate method will work if we set up the relation in models
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }

  if (!place) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("Place Not Found", 404));
  }
  // dont need toString here because of the populate
  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You dont OWN this place..", 401));
  }

  const imagePath = place.imageUrl;
  // return updated places array
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    // we can do the above only if we use populate, because it gives us full user object to work with
    console.log(place.creator);
    await sess.commitTransaction(); // only at this stage do we save to db
  } catch (err) {
    const error = new HttpError(err.message, 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }
  // delete the place image if used in filesystem
  fs.unlink(imagePath, err => {
    console.log(err);
  });
  // delete an image from cloudinary
  await cloudinary.uploader.destroy(place.filename);
  res.status(200);
  res.json({ message: "deleted", place: place.toObject({ getters: true }) });
};

const createNewPlace = async (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    let errors = validationErrors.array();
    // console.log(errors);
    // console.log(errors[0]["msg"]); // only do the first error
    // // console.log(errors["email"]["msg"]);
    return next(new HttpError(errors[0]["msg"], 422));
    // res.json(validationErrors.mapped());
  }

  const { title, description, address, city } = req.body;

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
    imageUrl: req.file.path,
    filename: req.file.filename,
    address,
    city,
    creator: req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
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

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createNewPlace = createNewPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
exports.findPlacesByCity = findPlacesByCity;
