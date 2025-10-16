const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["sso", "hom", "tom"]),
    body("projectId").optional().notEmpty().withMessage("Project ID is required"),
    body("projectName").optional().notEmpty().withMessage("Project name is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        email,
        password,
        role = "employee",
        department,
        phone,
        projectId,
        projectName,
      } = req.body;

      if (role === "sso" && (!projectId || !projectName)) {
        return res.status(400).json({ message: "Project ID and Project Name are required for SSO role" });
      }

      let employeeId;
      if (['sso', 'hom', 'tom'].includes(role)) {
        const prefix = role.toUpperCase();
        const lastUser = await User.findOne({ employeeId: new RegExp(`^${prefix}`) }).sort({ employeeId: -1 });
        let nextNumber = 1;
        if (lastUser) {
          const lastNumStr = lastUser.employeeId.slice(prefix.length);
          const lastNum = parseInt(lastNumStr, 10);
          nextNumber = lastNum + 1;
        }
        employeeId = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      } else {
        if (!req.body.employeeId) {
          return res.status(400).json({ message: "Employee ID is required" });
        }
        employeeId = req.body.employeeId;
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { employeeId }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User with this email or employee ID already exists",
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        employeeId,
        role,
        department,
        phone,
        projectId,
        projectName,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
          projectId: user.projectId,
          projectName: user.projectName,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          department: user.department,
          projectId: user.projectId,
          projectName: user.projectName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("employeeId").notEmpty().withMessage("Employee ID is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { employeeId, password } = req.body;

      // Find user by employeeId
      const user = await User.findOne({ employeeId }).select("+password");
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          employeeId: user.employeeId,
          role: user.role,
          projectId: user.projectId,
          projectName: user.projectName,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          department: user.department,
          lastLogin: user.lastLogin,
          projectId: user.projectId,
          projectName: user.projectName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    auth,
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
    body("department")
      .optional()
      .notEmpty()
      .withMessage("Department cannot be empty"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone, department } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (department) updateData.department = department;

      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post(
  "/change-password",
  [
    auth,
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select("+password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
