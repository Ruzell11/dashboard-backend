require("dotenv").config();

const express = require("express");
const generalRoutes = require("./routes/index");
const cookieParser = require("cookie-parser");
const connectDb = require("./db/index");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
connectDb();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", generalRoutes());

app.listen(PORT, () => {
  console.log("Server is Running");
});
