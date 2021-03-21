const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const dummyPlaces = [
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
    throw new HttpError("Place Not Found!", 404);
  }
  res.json({ message: "Found", placeId, place });
};

const getPlacesByUserId = (req, res, next) => {
  const uid = req.params.uid;
  // check if we have any users with that uid
  const places = dummyPlaces.filter(p => {
    return p.creator === uid;
  });
  if (places.length === 0) {
    // throw new HttpError("User Not Found innit! blood", 404);
    return next(new HttpError("User not found", 404));
  }
  res.json({ message: "Found", uid, count: places.length, places });
};

const createNewPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
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
