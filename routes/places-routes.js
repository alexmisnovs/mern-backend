const express = require("express");
const HttpError = require("../models/http-error");

const router = express.Router();

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

// will respond to antyhing after the slash, so its better to use something like: /places/pid
router.get("/place/:pid", (req, res, next) => {
  const placeId = req.params.pid;

  const place = dummyPlaces.find(p => {
    return p.id == placeId;
  });
  if (!place) {
    throw new HttpError("Place Not Found!", 404);
  }
  res.json({ message: "Found", placeId, place });
});

router.get("/user/:uid", (req, res, next) => {
  const uid = req.params.uid;
  // check if we have any users with that uid
  const places = dummyPlaces.filter(p => {
    return p.creator === uid;
  });
  if (places.length === 0) {
    return next(new HttpError("User not found", 404));
  }
  res.json({ message: "Found", uid, places: places.length });
});

module.exports = router;
