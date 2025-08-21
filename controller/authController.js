const { handleAsync } = require('../middleware/validation');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const response = require('../config/response');
const passport = require('../service/googleAuth');
const InvalidToken = require('../models/InvalidToken');

const register = handleAsync(async (req, res) => {
    const { username, email, password, fullName, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        return response(res, 400, 'User already exists', {
            errors: [
                ...(existingUser.email === email ? [{ field: 'email', message: 'Email already registered' }] : []),
                ...(existingUser.username === username ? [{ field: 'username', message: 'Username already taken' }] : []) // Nếu username đã tồn tại thì trả về lỗi
            ]
        });
    }

    // Create new user
    const user = new User({
        username,
        email,
        password,
        fullName,
        bio: bio || ''
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role
        }
    });
});

const login = handleAsync(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    response(res, 200, 'Login successful', { token, user });
});

const googleLogin = handleAsync(async (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

const googleCallback = handleAsync(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.redirect('/login');
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const encodedUser = encodeURIComponent(JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role
    }));

    return res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}&user=${encodedUser}`);
});

const getMe = handleAsync(async (req, res) => {
    const user = req.user;
    response(res, 200, 'Get me successfully', user);
});

const updateProfile = handleAsync(async (req, res) => {
    const { fullName, bio } = req.body;
    const user = req.user;

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    response(res, 200, 'Profile updated successfully', user);
});

const changePassword = handleAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        return response(res, 401, 'Invalid credentials', {
            errors: [{ field: 'currentPassword', message: 'Invalid current password' }]
        });
    }

    user.password = newPassword;
    await user.save();

    response(res, 200, 'Password changed successfully');
});

const logout = handleAsync(async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    await InvalidToken.create({ token });
    response(res, 200, 'Logout successfully');
});

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    googleLogin,
    googleCallback,
    logout
}