require("dotenv").config();

const express = require("express");
const generalRoutes = require("./routes/index");
const cookieParser = require("cookie-parser");
const connectDb = require("./db/index");
const cors = require("cors");
const app = express();
const errorHandler = require("./middleware/errorHandler");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
connectDb();
const PORT = process.env.PORT;

// Set up Multer middleware for handling file uploads
// Use the Multer middleware in your app
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1", generalRoutes());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server is Running");
});
