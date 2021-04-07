const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res, next) => {
  // const users = await User.find({}, '-password');
  let users;
  try {
    users = await User.find({}, "email name places imageUrl");
  } catch (error) {
    return next(new HttpError("Couldn't get the users", 500));
  }
  if (users.length === 0) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("No users so far", 404));
  }

  // obviously return without passwords or hash passwords
  res.status(200);
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const getUserById = async (req, res, next) => {
  // const users = await User.find({}, '-password');
  const uid = req.params.uid;
  let user;
  try {
    user = await User.findById(uid, "email name places imageUrl");
  } catch (error) {
    console.log(error);
    return next(new HttpError("Couldn't get the users", 500));
  }

  if (!user) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("User not found", 404));
  }

  // obviously return without passwords or hash passwords
  res.status(200);
  res.json({ user: user.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
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
  const { email, password } = req.body;

  // check if we have any users with that uid
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError("Login Failed", 500));
  }

  if (!existingUser) {
    // throw new HttpError("User Not Found innit! blood", 404);
    return next(new HttpError("User not found", 401));
  }
  let isValidPassword = false;
  try {
    isValidPassword = bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(new HttpError(`login failed, ${error.message}`, 500));
  }
  if (!isValidPassword) {
    // throw new HttpError("User Not Found innit! blood", 404);
    return next(new HttpError("Password wrong", 401));
  }
  res.json({ message: "logged in", user: existingUser.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
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
  const { name, email, password } = req.body;

  //basic validation
  if (!password || !email || !name) {
    return next(new HttpError("You must provide all required fields", 401));
  }
  // lets check if email or name are already taken eg user exists.
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError("Signup Failed", 500));
  }
  if (existingUser) {
    return next(new HttpError("signup failed email taken", 422));
  }
  let hashedPass;
  try {
    hashedPass = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Signup Failed, couldn't hash", 500));
  }

  const createdUser = new User({
    name,
    password: hashedPass, //TODO: encrypt password later
    imageUrl: req.file.path,
    email,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed", 500);
    console.log(err.message);
    console.log(err.code);
    return next(error);
  }
  // obviously live we dont return password
  res.status(201).json({ message: "User created", user: createdUser.toObject({ getters: true }) });
};

const updateUserById = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    res.status(422);
    res.json(validationErrors.array());
    return;
  }
  // make sure that we get what we need
  const uid = req.params.uid;
  const user = dummyUsers.find(u => {
    return u.id == uid;
  });
  if (!user) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("User not found", 404));
  }
  const { name, password, email } = req.body;
  const updatedUser = { ...dummyUsers.find(u => u.id === uid) };
  const userIndex = dummyUsers.findIndex(u => u.id === uid);
  // we need to update the fields what were passed, otherwise other fields will be empty
  // so if only name was passed, need to to only update it. or maybe compare with existing object
  if (name) updatedUser.name = name;
  if (password) updatedUser.password = password;
  if (email) updatedUser.email = email;

  // obviously now we need to do some sort of validation as well

  dummyUsers[userIndex] = updatedUser;

  // need to check if anything has actually changed or not..?
  res.status(200);
  res.json({ message: "updated", uid, updatedUser, body: req.body });
};
const deleteUserById = (req, res, next) => {
  //TODO: implement proper deletion from the database.
  //TODO: cascade deleting places and images of the places.
  const uid = req.params.uid;
  // check if we have any users with that uid
  const user = dummyUsers.find(u => {
    return u.id == uid;
  });
  if (!user) {
    // throw new HttuError("Place Not Found!", 404);
    return next(new HttpError("User not found", 404));
  }
  // return updated places array
  dummyUsers = dummyUsers.filter(u => {
    return u.id !== uid;
  });
  res.status(200);
  res.json({ message: `deleted: , ${uid}`, dummyUsers });
};

exports.signup = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
