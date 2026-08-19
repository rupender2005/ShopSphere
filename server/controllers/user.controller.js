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
// Update User
const updateUser = async (req, res) => {
  try {
    const { name, phone, avatar, address } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (address !== undefined) {
      if (address.street !== undefined) {
        updateData["address.street"] = address.street;
      }

      if (address.city !== undefined) {
        updateData["address.city"] = address.city;
      }

      if (address.state !== undefined) {
        updateData["address.state"] = address.state;
      }

      if (address.postalCode !== undefined) {
        updateData["address.postalCode"] = address.postalCode;
      }

      if (address.country !== undefined) {
        updateData["address.country"] = address.country;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    return ResponseHandler(
      res,
      200,
      true,
      "User updated successfully",
      updatedUser,
    );
  } catch (error) {
    console.error("Error in server > controllers > user:", error);

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
