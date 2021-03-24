const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const User = require("../models/user");

let dummyUsers = [
  {
    id: "1",
    username: "dennis",
    email: "dennis@misnov.com",
    password: "12345",
  },
  {
    id: "2",
    username: "alex",
    email: "alex@misnovs.com",
    password: "12345",
  },
];

const getAllUsers = (req, res, next) => {
  if (dummyUsers.length === 0) {
    // throw new HttpError("Place Not Found!", 404);
    return next(new HttpError("No users so far", 404));
  }
  // obviously return without passwords or hash passwords
  res.status(200);
  res.json({ dummyUsers });
};

const login = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    res.status(422);
    res.json(validationErrors.array());
  }
  const { email, password } = req.body;

  // check if we have any users with that uid
  const user = dummyUsers.find(p => {
    return p.email === email;
  });
  if (!user || user.password !== password) {
    // throw new HttpError("User Not Found innit! blood", 404);
    return next(new HttpError("User not found or wrong credentials provided", 404));
  }

  res.json({ message: "logged in", uid: user.id });
};

const signup = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    res.status(422);
    res.json(validationErrors.mapped());
  }
  const { username, email, password } = req.body;

  //basic validation
  if (!password || !email || !username) {
    return next(new HttpError("You must provide all required fields", 401));
  }
  // lets check if email or username are already taken eg user exists.
  if (dummyUsers.find(u => u.email === email)) {
    return next(new HttpError("email taken..", 401));
  }
  if (dummyUsers.find(u => u.username === username)) {
    return next(new HttpError("username taken..", 401));
  }

  const createdUser = {
    id: uuidv4(),
    username,
    password,
    email,
  };

  dummyUsers.push(createdUser); // can use unshift

  res.status(201).json({ message: "User created", user: createdUser });
};

const updateUserById = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    res.status(422);
    res.json(validationErrors.array());
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
  const { username, password, email } = req.body;
  const updatedUser = { ...dummyUsers.find(u => u.id === uid) };
  const userIndex = dummyUsers.findIndex(u => u.id === uid);
  // we need to update the fields what were passed, otherwise other fields will be empty
  // so if only username was passed, need to to only update it. or maybe compare with existing object
  if (username) updatedUser.username = username;
  if (password) updatedUser.password = password;
  if (email) updatedUser.email = email;

  // obviously now we need to do some sort of validation as well

  dummyUsers[userIndex] = updatedUser;

  // need to check if anything has actually changed or not..?
  res.status(200);
  res.json({ message: "updated", uid, updatedUser, body: req.body });
};
const deleteUserById = (req, res, next) => {
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
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
