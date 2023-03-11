const UserModel = require("../model/UserModel");
const TeamMember = require("../model/CreateTeamModel");
const bcrypt = require("bcrypt");
const { createTokens } = require("../middleware/index");
const { HTTP_BAD_REQUEST, FAILED, HTTP_OK, SUCCESS } = require("../global");

const createUserController = () => {


  const UserLogin = async (req, res) => {
    const { email, password } = req.body;

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await TeamMember.findOne({ email });
      if (!user) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "Incorrect email or password!" });
      }
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
    res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "User logged in",
      user_details: {
        role_id: user.role_id,
        id: user.id,
      },
    });
  };


  const UserProfile = async (req, res) => {
    const { id } = req.params;

    const user_profile = await UserModel.findById(id);

    if (!user_profile) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "User does not exist" });
    }

    res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "User details found",
      user_details: {
        username: user_profile.username,
        email: user_profile.email,
        role_id: user_profile.role_id,
      },
    });
  };

  const CreateTeamMembers = (req, res) => {
    const created_by_id = req.params.id;
    const { username, first_name, last_name, email, password, role_id } =
      req.body;

    if (
      !created_by_id ||
      !username ||
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !role_id
    ) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Missing fields are required" });
    }

    const newTeamMember = new TeamMember({
      created_by: created_by_id,
      username,
      first_name,
      last_name,
      email,
      password,
      role_id,
    });
    newTeamMember.save();

    return res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "Successfully added ",
      team_member_details: newTeamMember,
    });
  };

  const GetTeamMembers = async (req, res) => {
    const created_by_id = req.params.id

    const user_profile = await UserModel.findById(created_by_id);

    if (!user_profile) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "User does not exist" });
    }

    const listOfMember = await TeamMember.find({ created_by: created_by_id })

    if (listOfMember.length === 0) {
      return res
        .status(HTTP_OK)
        .json({ success: SUCCESS, message: "No members found" });
    }

    return res.status(HTTP_OK).json({
      success: SUCCESS,
      message: 'List of your team members',
      team_leader_name: user_profile.username,
      listOfMember
    })
  }

  return { UserLogin, UserProfile, CreateTeamMembers, GetTeamMembers };
};

module.exports = createUserController;
