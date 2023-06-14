const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs"); //this is require bcz for the file system

const bcrypt = require("bcryptjs");
const saltRounds = 10;
const secretKey = "rthbgfghrtgsbherds";
require("dotenv").config();
app.use(cors({ credentials: true, origin: process.env.BASE_URL }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal server error" });
});
mongoose.connect(process.env.MONGODB_URL);
mongoose.connection.on(
	"error",
	console.error.bind(console, "MongoDB connection error:")
);
mongoose.connection.once("open", () => {
	console.log("Connected to MongoDB");
});

// Register
app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		// Check if the user already exists
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json("Username already exists");
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create a new user
		const newUser = new User({
			username,
			password: hashedPassword,
		});
		await newUser.save();

		res.status(200).json(newUser);
	} catch (error) {
		console.log("Error registering user:", error);
		res.status(500).json("An error occurred while registering user");
	}
});

// Login
app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		// Find the user in the database
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json("User not found");
		}

		// Compare the provided password with the stored hash
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (isPasswordValid) {
			// Generate a JWT token
			const token = jwt.sign(
				{ username: user.username, id: user._id },
				secretKey
			);

			// Set the token as a cookie in the response
			res.cookie("token", token, { httpOnly: true }).json({
				id: user._id,
				username: user.username,
			});
		} else {
			res.status(400).json("Wrong credentials");
		}
	} catch (error) {
		console.log("Error logging in:", error);
		res.status(500).json("An error occurred while logging in");
	}
});

// Profile
app.get("/profile", async (req, res) => {
	const { token } = req.cookies;
	if (!token) {
		return res.status(401).json("Unauthorized");
	}

	try {
		// Verify and decode the JWT token
		const decoded = jwt.verify(token, secretKey);
		const { username, id } = decoded;

		// Find the user in the database
		const user = await User.findById(id);
		if (!user) {
			return res.status(400).json("User not found");
		}

		res.json({ id: user._id, username });
	} catch (error) {
		console.log("Error retrieving user profile:", error);
		res.status(500).json("An error occurred while retrieving user profile");
	}
});

// Logout
app.post("/logout", async (req, res) => {
	res.clearCookie("token").json("Logged out successfully");
});

//upload
//the data to the DB then fetch to the client-side
app.post(
	"/create-new-post",
	uploadMiddleware.single("image"),
	async (req, res) => {
		//to grab the file from request we need library multer..
		const { originalname, path } = req.file;
		const parts = originalname.split(".");
		const ext = parts[parts.length - 1]; //we get the last part jpg
		// res.json(req.file);
		const newPath = path + "." + ext;
		fs.renameSync(path, newPath);

		//now grab the json web from cookies here
		const { token } = req.cookies;
		jwt.verify(token, secretKey, {}, async (err, info) => {
			if (err) throw err;

			//we want to save it the dataBase

			const { title, summary, content } = req.body;
			//this creating the post table into the database and store into db...
			const postDB = await Post.create({
				title,
				summary,
				content,
				cover: newPath,
				// you can grab the id from jwt token(info)
				author: info.id,
			});
			res.json(postDB);
			// res.json(info);
		});

		// res.json({ ext });
		// res.json({ postDB });
	}
);

//update the editPost
app.put(
	"/create-new-post",
	uploadMiddleware.single("image"),
	async (req, res) => {
		let newPath = null;
		if (req.file) {
			const { originalname, path } = req.file;
			const parts = originalname.split(".");
			const ext = parts[parts.length - 1]; //we get the last part jpg
			// res.json(req.file);
			newPath = path + "." + ext;
			fs.renameSync(path, newPath);
		}
		//now here we update the Edit-post
		//grab the cookies for update the editPost
		const { token } = req.cookies;
		jwt.verify(token, secretKey, {}, async (err, info) => {
			if (err) throw err;
			const { id, title, summary, content } = req.body;
			//first grab the post
			const postDocGrab = await Post.findById(id);
			//if we get the information
			const isAuthor =
				JSON.stringify(postDocGrab.author) === JSON.stringify(info.id);
			// res.json({ isAuthor, postDocGrab, info });
			if (!isAuthor) {
				return res.status(400).json("invalid author");
			}

			//if we are author
			await postDocGrab.updateOne({
				title,
				summary,
				content,
				cover: newPath ? newPath : postDocGrab.cover,
			});

			// //this creating the post table into the database and store into db...
			// const postDB = await Post.create({
			// 	title,
			// 	summary,
			// 	content,
			// 	cover: newPath,
			// 	// you can grab the id from jwt token(info)
			// 	author: info.id,
			// });
			// res.json(postDB);
			// res.json(info);
			res.json(postDocGrab);
		});
		// res.json({ test: 4, fileIs: req.file });
	}
);

//upload to PostPage by default get use
//taking the data from the server side and post on clint-side
// app.get("/create-new-post", async (req, res) => {
// 	const postInfo = await Post.find()
// 		.populate("author", ["username"])
// 		.sort({ createdAt: -1 })
// 		.limit(20); //max post show will be 20 only
// 	res.json(postInfo);
// });
app.get("/create-new-post", async (req, res) => {
	try {
		const postInfo = await Post.find()
			.populate({
				path: "author",
				select: "username",
			})
			.sort({ createdAt: -1 })
			.limit(20);
		res.json(postInfo);
		// console.log(postInfo);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

//sending NewPost information to the DB
app.get("/create-new-post/:id", async (req, res) => {
	try {
		const { id } = req.params; //grab the id
		const postIdDoc = await Post.findById(id).populate("author", ["username"]);
		res.json(postIdDoc);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

//server Running
const port = process.env.PORT || 4080;
app.listen(port, (error) => {
	if (error) {
		console.log(`Error starting the server: ${error}`);
	}
	console.log(`Server is running on port 4080`);
});

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const User = require("./models/User.js");
// const app = express();
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

// const bcrypt = require("bcryptjs");
// const salt = bcrypt.genSaltSync(10);
// const secretKey = "rthbgfghrtgsbherds";

// app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// app.use(express.json());
// app.use(cookieParser());
// //this is the connection string for the mongodb
// //mongodb+srv://blog:blog-name-mern@cluster0.poyc85i.mongodb.net/?retryWrites=true&w=majority
// //connect with the mongoose database
// mongoose.connect(
// 	"mongodb+srv://blog:blog-name-mern@cluster0.poyc85i.mongodb.net/?retryWrites=true&w=majority"
// );
// //you are sending the data in form of json to the client side
// // Register
// //db
// app.post("/register", async (req, res) => {
// 	const { username, password } = req.body;
// 	try {
// 		const userDoc = await User.create({
// 			username: username,
// 			password: bcrypt.hashSync(password, salt),
// 		});
// 		res.status(200).json(userDoc);
// 		// res.header();
// 	} catch (error) {
// 		console.log(`username or password already exist`);
// 		res.status(400).json(`username or password already exist ${error}`);
// 	}
// });

// //login to the website
// // app.post("/login", async (req, res) => {
// // 	const { username, password } = req.body; //take the username and password from the client side
// // 	try {
// // 		const userDoc = await User.find({ username });
// // 		//if we get the username
// // 		//bcrypt.compareSync("B4c0/\/", hash)
// // 		const passOk = bcrypt.compareSync(password, userDoc.password); // true
// // 		if (passOk) {
// // 			//user is logged in successfully
// // 			//then response with json web-token
// // 			jwt.sign(
// // 				{ username: username, id: userDoc._id },
// // 				secretKey,
// // 				{},
// // 				(err, token) => {
// // 					if (err) {
// // 						throw err;
// // 					}
// // 					// res.json(token);
// // 					//now we want to send it as a cookies not into the json
// // 					res.cookie("token", token).json("ok");
// // 				}
// // 			);
// // 			res.status(200).json("");
// // 		} else {
// // 			//user is not logged in
// // 			res.status(400).json("wrong credentials");
// // 		}
// // 		// res.json(passOk);
// // 	} catch (e) {
// // 		console.log(e);
// // 		res.json(e);
// // 	}
// // });

// app.post("/login", async (req, res) => {
// 	const { username, password } = req.body;
// 	try {
// 		const userDoc = await User.findOne({ username });
// 		if (!userDoc) {
// 			return res.status(400).json("User not found");
// 		}
// 		const passOk = bcrypt.compareSync(password, userDoc.password);
// 		if (passOk) {
// 			jwt.sign(
// 				{ username: username, id: userDoc._id },
// 				secretKey,
// 				{},
// 				(err, token) => {
// 					if (err) {
// 						throw err;
// 					}
// 					res.cookie("token", token).json({
// 						id: userDoc._id,
// 						username,
// 					});
// 				}
// 			);
// 		} else {
// 			res.status(400).json("Wrong credentials");
// 		}
// 	} catch (error) {
// 		console.log("Error logging in:", error);
// 		res.status(500).json("An error occurred while logging in");
// 	}
// });

// //when u login then move to the profile page
// //now from here fetch the cookies details from client side to server side
// //this will be encrypted
// app.get("/profile", async (req, res) => {
// 	const { token } = req.cookies;
// 	jwt.verify(token, secretKey, {}, (err, info) => {
// 		if (err) throw err;
// 		res.json(info);
// 	});
// 	// res.json(req.cookies);
// });

// app.post("/logout", async (req, res) => {
// 	res.cookie("token", "").json("ok");
// });
// // app.post("/logout", (req, res) => {
// // 	res.clearCookie("token",'');
// // 	res.json({ message: "Logout successful" });
// // });

// app.listen(4080, (error) => {
// 	if (error) {
// 		console.log(`Getting something Wrong ${error}`);
// 	}
// 	console.log(`Server is started here at port ${4080}`);
// });

// //  this is the password.... of the mern and this is used for the application
// //mongodb+srv://blog:blog-name-mern@cluster0.poyc85i.mongodb.net/?retryWrites=true&w=majority
