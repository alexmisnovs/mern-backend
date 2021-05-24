const axios = require("axios");
const HttpError = require("../models/http-error");
require("dotenv").config();

const getCoordsForAddress = async address => {
  let data;
  try {
    const url = "https://api.mapbox.com/geocoding/v5";
    const endpoint = "mapbox.places";
    const searchText = encodeURIComponent(address);
    const response = await axios({
      method: "GET",
      url: `${url}/${endpoint}/${searchText}.json/?access_token=${process.env.MAPBOX_API}`,
    });
    data = response.data;
  } catch (e) {
    throw new HttpError("Something went wrong", 500);
  }

  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError("Could not find location for the specified address.", 422);
  }

  const [lng, lat] = data.features[0].center;

  return { lat, lng };
};
module.exports = getCoordsForAddress;
