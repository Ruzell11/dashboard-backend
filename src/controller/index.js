const UserModel = require("../model/index");
const bcrypt = require("bcrypt");
const { createTokens } = require("../middleware/index");
const { HTTP_BAD_REQUEST, FAILED, HTTP_OK, SUCCESS } = require("../global");

const createUserController = () => {
  const UserRegister = async (req, res) => {
    const { username, password, role_id, email } = req.body;
    const saltRounds = 10;

    if (!username || !password || !role_id || !email)
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Missing Fields are required" });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new UserModel({
      username,
      password: hashedPassword,
      role_id,
      email,
    });

    newUser.save();
    return res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "Register Successfully",
      user_details: newUser,
    });
  };

  const UserLogin = async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Incorrect email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Incorrect email or password!" });
    }

    const accessToken = createTokens(user);

    res.cookie("access-token", accessToken, {
      maxAge: 60 * 60 * 24 * 30,
    });
    res.set("access-token", accessToken);
    res.status(HTTP_OK).json({ success: SUCCESS, message: "User logged in" });
  };

  const UserProfile = (req, res) => {
    res
      .status(HTTP_OK)
      .json({ success: SUCCESS, message: "this is the profile" });
  };

  return { UserLogin, UserRegister, UserProfile };
};

module.exports = createUserController;
