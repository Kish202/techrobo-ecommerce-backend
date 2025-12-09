import Admin from '../models/admin.js';

// @desc    Register admin (first time setup or superadmin creating new admin)
// @route   POST /api/auth/register
// @access  Public (should be restricted in production)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin'
    });

    // Generate token
    const token = admin.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      message: 'Admin registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordLength: password?.length });

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for admin (include password field)
    const admin = await Admin.findOne({ email }).select('+password');

    console.log('Admin found:', admin ? 'Yes' : 'No');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();

    // Generate token
    const token = admin.getSignedJwtToken();

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    await admin.save();

    res.json({
      success: true,
      data: admin,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    // Generate new token
    const token = admin.getSignedJwtToken();

    res.json({
      success: true,
      token,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins (superadmin only)
// @route   GET /api/auth/admins
// @access  Private/Superadmin
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-password');

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate admin (superadmin only)
// @route   PUT /api/auth/admins/:id/deactivate
// @access  Private/Superadmin
export const deactivateAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    admin.isActive = false;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate admin (superadmin only)
// @route   PUT /api/auth/admins/:id/activate
// @access  Private/Superadmin
export const activateAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    admin.isActive = true;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin activated successfully'
    });
  } catch (error) {
    next(error);
  }
};