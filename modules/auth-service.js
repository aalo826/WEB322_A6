require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});


let User; // to be defined on new connection (see initialize)

async function initialize() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      User = db.model("User", userSchema);
      resolve();
    });
  });
}

async function registerUser(userData) {
  // Check if passwords match
  if (userData.password !== userData.password2) {
    throw new Error("Passwords do not match");
  }

  try {
    // Hash the password then store it
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new User({
      userName: userData.userName,
      password: hashedPassword,
      email: userData.email,
      loginHistory: [
        {
          dateTime: new Date(),
          userAgent: userData.userAgent,
        },
      ],
    });

    await newUser.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("User Name already taken");
    } else {
      throw new Error(`There was an error creating the user: ${err.message}`);
    }
  }
}

// Function to check if a user exists and verify the password
async function checkUser(userData) {
  try {
    // Find the user in the database by userName
    const users = await User.find({ userName: userData.userName });

    if (users.length === 0) {
      throw new Error(`Unable to find user: ${userData.userName}`);
    }

    // Compare password with the hashed password in the database
    const isMatch = await bcrypt.compare(userData.password, users[0].password);

    if (!isMatch) {
      throw new Error(`Incorrect Password for user: ${userData.userName}`);
    }

    // Password matches, update the loginHistory
    if (users[0].loginHistory.length === 8) {
      users[0].loginHistory.pop();
    }

    // Add new entry at the start of the loginHistory
    users[0].loginHistory.unshift({
      dateTime: new Date().toString(),
      userAgent: userData.userAgent,
    });

    // Update the user document
    await User.updateOne(
      { userName: users[0].userName },
      { $set: { loginHistory: users[0].loginHistory } }
    );

    return users[0];
  } catch (err) {
    throw new Error(`There was an error verifying the user: ${err.message}`);
  }
}

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
