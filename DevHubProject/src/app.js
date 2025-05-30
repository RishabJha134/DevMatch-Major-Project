const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
require("dotenv").config();
const { rateLimit } = require("express-rate-limit");

// require("./utils/cron");
// console.log(process.env)

// database connection:-
const { connectDB } = require("./config/database");

// Enable CORS for cross-origin requests
// Allowed Frontend URLs
const allowedOrigins = [
  "https://dev-match-major-project.vercel.app",
  "https://dev-match-major-project-git-main-rishab-jha-projects.vercel.app",
  "https://dev-match-major-project-bu0pky9kl-rishab-jha-projects.vercel.app",
  "https://dev-match-major-project-rishab-jha-projects.vercel.app",
];

// Configure CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Include if using cookies or credentials
};

// Use CORS middleware
app.use(cors(corsOptions));

// middleware is active for all the routes:- convert backend ke andar ka json data jo hum bhej rahe hai usko js object me kar rha hai. json -> js objects and make this readable for in the req.body in every api:-
app.use(express.json());

// cookie-parser
app.use(cookieParser()); // Correct initialization

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

// TODO:-
// .env file for both frontend and backend:-

// Serve static files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routing:-
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

// we want to secure for all the routes:-
app.use(rateLimiter); // Apply rate limiting to all requests

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB();
server.listen(process.env.PORT, () => {
  console.log("Server is listening on port 7777");
});

// this is just for testing purpose:-

// extras:-
// static signup static routes:-
// app.post("/signup", async (req, res) => {
//   // creating a new instance of the User Model.
//   const user = new User({
//     firstName: "Rishab",
//     lastName: "Jha",
//     emailId: "rishab.jha@gmail.com",
//     password: "123456789",
//   });

//   try {
//     await user.save();
//     res.send("User Added successfully!");
//     console.log(user);
//   } catch (err) {
//     console.error("Error adding user:", err);
//     res.status(400).send("Server Error:"+err.message); // Returning a 500 Internal Server Error.
//   }
// });

// get user by id:-
// app.get("/userbyid", async (req, res) => {
//   const users = await User.findById({_id:req.body._id});
//   console.log(users);
// })

// update by using the email:-
// app.patch("/user", async (req, res) => {
//   const { emailId } = req.body;
//   const data = req.body;
//   try {
//     const user = await User.findOneAndUpdate({ emailId: emailId }, data, {
//       returnDocument: "after",
//     });
//     console.log(user);
//   } catch (err) {
//     console.error("Error updating user", err.message);
//     res.status(500).send("Server Error:" + err.message); // Returning a 500 Internal Server Error.
//   }
// });

// second method for signup:-
// app.post("/signup", async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     emailId,
//     password,
//     gender,
//     age,
//     photoUrl,
//     about,
//     skills,
//   } = req.body;
//   console.log(req.body);

//   try {

//     const alreadyExist = await User.findOne({ emailId: emailId });

//     if (alreadyExist) {
//       throw new Error("User already exists with this emailId");
//     }

//     const user = await User({
//       firstName: firstName,
//       lastName: lastName,
//       emailId: emailId,
//       password: password,
//       gender: gender,
//       age: age,
//       photoUrl,
//       about,
//       skills,
//     });

//     console.log(user);
//     await user.save();
//     res.send("user added successfully");

//   } catch (err) {
//     console.error("Error adding user", err.message);
//     res.status(400).send("Server Error:" + err.message);
//   }
// });
// find user api:-
// app.get("/user", async (req, res) => {
//   const { emailId } = req.body;

//   try {
//     const users = await User.find({ emailId: emailId });
//     if (users.length == 0) {
//       res.status(404).send("No user found with this emailId");
//     } else {
//       res.send({ users });
//     }
//   } catch (err) {
//     console.error("Error finding user", err.message);
//     res.status(500).send("Server Error:" + err.message); // Returning a 500 Internal Server Error.
//   }
// });

// // feed api:- GET /feed - get all the users from the database.
// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send({ users });
//   } catch (err) {
//     console.error("Error finding users", err.message);
//     res.status(500).send("Server Error:" + err.message); // Returning a 500 Internal Server Error.
//   }
// });

// // delete a user by id:-
// app.delete("/user", async (req, res) => {
//   const { _id } = req.body;
//   try {
//     const deletedUser = await User.findByIdAndDelete({ _id: _id });
//     if (deletedUser) {
//       res.send("User deleted successfully");
//     } else {
//       res.status(404).send("No user found with this id");
//     }
//   } catch (err) {
//     console.error("Error deleting user", err.message);
//     res.status(500).send("Server Error:" + err.message); // Returning a 500 Internal Server Error.
//   }
// });

// // update a user:-
// app.patch("/user/:userId", async (req, res) => {
//   const _id = req.params.userId;
//   const {
//     firstName,
//     lastName,
//     password,
//     gender,
//     age,
//     photoUrl,
//     about,
//     skills,
//   } = req.body;
//   try {
//     if (skills.length > 11) {
//       throw new Error("skills cannot be more than 11");
//     }

//     const data = {
//       firstName,
//       lastName,
//       password,
//       gender,
//       age,
//       photoUrl,
//       about,
//       skills,
//     };

//     const user = await User.findByIdAndUpdate({ _id: _id }, data, {
//       returnDocument: "after",
//       runValidators: true,
//     });
//     res.send("User updated Successfully:" + user);
//     console.log(user);
//   } catch (err) {
//     console.error("Error updating user", err.message);
//     res.status(500).send("Server Error:" + err.message); // Returning a 500 Internal Server Error.
//   }
// });
