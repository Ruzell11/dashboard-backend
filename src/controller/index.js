const UserModel = require("../model/UserModel");
const TeamMember = require("../model/CreateTeamModel");
const bcrypt = require("bcrypt");
const { createTokens } = require("../middleware/index");
const { HTTP_BAD_REQUEST, FAILED, HTTP_OK, SUCCESS } = require("../global");

const createUserController = () => {
  const UserLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        const team_member = await TeamMember.findOne({ email });
        if (!team_member) {
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
    } catch (error) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, error });
    }
  }

  const UserProfile = async (req, res) => {
    const { id } = req.params;

    try {
      const user_profile = await UserModel.findById(id);

      if (!user_profile) {
        const team_member = await TeamMember.findById(id)

        if (!team_member) {
          return res
            .status(HTTP_BAD_REQUEST)
            .json({ success: FAILED, message: "User does not exist" });
        }
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
    } catch (error) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, error });
    }

  };

  const CreateTeamMembers = async (req, res) => {
    const created_by_id = req.query?.created_by_id
    const { username, first_name, last_name, email, password, role_id } = req.body;
    const saltRounds = 10;


    if (role_id !== 1 && (!created_by_id || !username || !first_name || !last_name || !email || !password || !role_id)) {
      return res.status(HTTP_BAD_REQUEST).json({ success: FAILED, message: 'Missing fields are required' });
    }

    if (role_id === 1 && (!username || !first_name || !last_name || !email || !password || !role_id)) {
      return res.status(HTTP_BAD_REQUEST).json({ success: FAILED, message: 'Missing fields are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newMember = role_id === 1 ?
        new UserModel({ email, username, password: hashedPassword, role_id, last_name, first_name }) :
        new TeamMember({ created_by: created_by_id, username, first_name, last_name, email, password: hashedPassword, role_id });

      await newMember.save();

      return res.status(HTTP_OK).json({
        success: SUCCESS,
        message: 'Successfully added',
        team_member_details: newMember,
      });
    } catch (error) {

      return res.status(HTTP_BAD_REQUEST).json({ success: FAILED, error });
    }
  };


  const GetTeamMembers = async (req, res) => {
    const created_by_id = req.params.id

    try {
      if (!created_by_id) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "Id is required" });
      }

      let user_profile = await UserModel.findById(created_by_id);

      if (!user_profile) {
        user_profile = await TeamMember.findById(created_by_id);
        if (!user_profile) {
          return res
            .status(HTTP_BAD_REQUEST)
            .json({ success: FAILED, message: "User does not exist" });
        }
      }

    } catch (error) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, error });
    }

  }

  const EditUserDetails = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    try {
      if (!id) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ success: FAILED, message: "Id is required" });
      }

      const user_profile = await UserModel.findByIdAndUpdate(id, body, {
        new: true
      });

      if (!user_profile) {
        const team_member = await TeamMember.findByIdAndUpdate(id, body, {
          new: true
        });

        if (!team_member) {

          return res
            .status(HTTP_BAD_REQUEST)
            .json({ success: SUCCESS, message: "User does not exist." });
        }
      }

      return res
        .status(HTTP_OK)
        .json({ success: SUCCESS, message: "User successfully updated." });
    }
    catch (error) {

      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, error });
    }
  };

  const DeleteUserDetails = async (req, res) => {
    const { user_id, created_by_id } = req.query;

    try {
      if (!user_id || !created_by_id) {
        return res.status(HTTP_BAD_REQUEST).json({ success: FAILED, message: 'Invalid Request' })
      }

      const teamMembers = await TeamMember.findById(user_id);

      if (!teamMembers) {
        return res.status(HTTP_BAD_REQUEST).json({ success: FAILED, message: 'User does not exist' });
      }

      const team_member_created_by_id = teamMembers.created_by.toString();

      if (team_member_created_by_id != created_by_id) {
        return res.status(HTTP_BAD_REQUEST).json({ success: FAILED, message: "Permission denied" });
      }

      await TeamMember.findByIdAndDelete(user_id);

      return res.status(HTTP_OK).json({ success: SUCCESS, message: 'User successfully deleted' });
    } catch (error) {

      return res.status(HTTP_BAD_REQUEST).json({ success: FAILED, error });
    }
  }

  return { UserLogin, UserProfile, CreateTeamMembers, GetTeamMembers, EditUserDetails, DeleteUserDetails };
};

module.exports = createUserController;
