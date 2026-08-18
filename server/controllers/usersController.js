const User = require('../models/User');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      ...user,
      id: user._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { ...req.body } },
      { new: true, runValidators: true },
    ).select('-password');

    res.status(200).json({
      ...updatedUser.toObject(),
      id: updatedUser._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};
