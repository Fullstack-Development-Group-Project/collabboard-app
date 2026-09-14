const User = require('../models/User');
const db = require('../data/memoryStore');

exports.getUserProfile = async (req, res, next) => {
  try {
    try {
      const user = await User.findById(req.user.id).select('-password').lean();
      if (user) {
        return res.status(200).json({
          ...user,
          id: user._id.toString(),
        });
      }
    } catch (dbError) {
      console.log('Database error in getUserProfile, using memory store');
    }

    const memUser = db.users.find(u => u.id === req.user.id || u.email === req.user.email);
    if (!memUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...safeUser } = memUser;
    return res.status(200).json(safeUser);
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, email, jobTitle, bio } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (user) {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (jobTitle !== undefined) updates.jobTitle = jobTitle;
        if (bio !== undefined) updates.bio = bio;

        const updatedUser = await User.findByIdAndUpdate(
          req.user.id,
          { $set: updates },
          { new: true, runValidators: true },
        ).select('-password');

        return res.status(200).json({
          ...updatedUser.toObject(),
          id: updatedUser._id.toString(),
        });
      }
    } catch (dbError) {
      console.log('Database error in updateUserProfile, using memory store');
    }

    const memUser = db.users.find(u => u.id === req.user.id || u.email === req.user.email);
    if (!memUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) memUser.name = name;
    if (jobTitle !== undefined) memUser.jobTitle = jobTitle;
    if (bio !== undefined) memUser.bio = bio;

    const { password, ...safeUser } = memUser;
    return res.status(200).json(safeUser);
  } catch (error) {
    next(error);
  }
};

