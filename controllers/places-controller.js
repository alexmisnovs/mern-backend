const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
//TODO: make get coords work with google api as well. atm only with mapbox
const getCoordsForAddress = require("../utils/location");

let dummyPlaces = [
  {
    id: "1",
    title: "Empire State building 2",
    description: "One of the most famous buildings",
    imageUrl: "https://picsum.photos/200/300",
    address: "20 W 34th St, New York, NY 10001, United States",
    location: {
      lat: 40.7484405,
      lng: -73.9856644,
    },
    creator: "1",
  },
  {
    id: "2",
    title: "Empire State building 1",
    description: "One of the most famous buildings",
    imageUrl: "https://picsum.photos/200/300",
    address: "20 W 34th St, New York, NY 10001, United States",
    location: {
      lat: 40.7484405,
      lng: -73.9856644,
    },
    creator: "1",
  },
  {
    id: "3",
    title: "Empire State building",
    description: "One of the most famous buildings",
    imageUrl: "https://picsum.photos/200/300",
    address: "20 W 34th St, New York, NY 10001, United States",
    location: {
      lat: 40.7484405,
      lng: -73.9856644,
    },
    creator: "2",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;

  const place = dummyPlaces.find(p => {
    return p.id == placeId;
  });
  if (!place) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("Place not found", 404));
  }
  res.json({ message: "Found", placeId, place });
};

const getPlacesByUserId = (req, res, next) => {
  const uid = req.params.uid;
  // check if we have any users with that uid
  const places = dummyPlaces.filter(p => {
    return p.creator === uid;
  });
  if (!places || places.length === 0) {
    // throw new HttpError("User Not Found innit! blood", 404);
    return next(new HttpError("User not found", 404));
  }
  res.json({ message: "Found", uid, count: places.length, places });
};

const updatePlaceById = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    res.status(422);
    res.json(validationErrors.mapped());
  }

  const { title, description, coordinates, address } = req.body;
  const pid = req.params.pid;
  const updatedPlace = { ...dummyPlaces.find(p => p.id === pid) };
  const placeIndex = dummyPlaces.findIndex(p => p.id === pid);
  if (title) updatedPlace.title = title;
  if (description) updatedPlace.description = description;
  // updatePlace.coordinates = coordinates;
  // updatePlace.address = address;

  dummyPlaces[placeIndex] = updatedPlace;
  const place = dummyPlaces.find(p => {
    return p.id == pid;
  });
  if (!place) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("Place not found", 404));
  }
  // need to check if anything has actually changed or not..?
  res.status(200);
  res.json({ message: "updated", pid, updatedPlace });
};
const deletePlaceById = (req, res, next) => {
  const pid = req.params.pid;
  // check if we have any users with that uid
  const place = dummyPlaces.find(p => {
    return p.id == pid;
  });
  if (!place) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("Place not found", 404));
  }
  // return updated places array
  dummyPlaces = dummyPlaces.filter(p => {
    return p.id !== pid;
  });
  res.status(200);
  res.json({ message: "deleted", pid, dummyPlaces });
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

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  dummyPlaces.push(createdPlace); // can use unshift

  res.status(201).json({ place: createdPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createNewPlace = createNewPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
