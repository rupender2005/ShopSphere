const bcrypt = require("bcryptjs");
const { User } = require("../models/user.model");
const { ResponseHandler } = require("../utils/responseHandler");

// Get User
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    return ResponseHandler(res, 200, true, "User fetched successfully", user);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > user",
    );
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { name, phone, avatar, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.avatar = avatar ?? user.avatar;

    if (address) {
      user.address.street = address.street ?? user.address.street;
      user.address.city = address.city ?? user.address.city;
      user.address.state = address.state ?? user.address.state;
      user.address.postalCode = address.postalCode ?? user.address.postalCode;
      user.address.country = address.country ?? user.address.country;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    return ResponseHandler(
      res,
      200,
      true,
      "User updated successfully",
      updatedUser,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > user",
    );
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ResponseHandler(
        res,
        400,
        false,
        "Current password and new password are required",
      );
    }

    if (newPassword.length < 8) {
      return ResponseHandler(
        res,
        400,
        false,
        "New password must be at least 8 characters",
      );
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordMatch) {
      return ResponseHandler(res, 401, false, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.loginToken = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return ResponseHandler(res, 200, true, "Password changed successfully");
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > user",
    );
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    await User.findByIdAndDelete(req.user._id);

    return ResponseHandler(res, 200, true, "User deleted successfully");
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > user",
    );
  }
};

module.exports = {
  getUser,
  updateUser,
  changePassword,
  deleteUser,
};
