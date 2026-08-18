const Team = require('../models/Team');
const Board = require('../models/Board');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      name: trimmedName,
      description: description || '',
      members: [{ userId: req.user.id, role: 'admin' }],
      createdBy: req.user.id,
    });

    res.status(201).json({
      ...team.toObject(),
      id: team._id.toString(),
      createdBy: team.createdBy.toString(),
      members: team.members.map((member) => ({
        ...member,
        userId: member.userId.toString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ 'members.userId': req.user.id }).sort({ createdAt: -1 }).lean();

    res.status(200).json(teams.map((team) => ({
      ...team,
      id: team._id.toString(),
      createdBy: team.createdBy ? team.createdBy.toString() : null,
      members: team.members.map((member) => ({ ...member, userId: member.userId.toString() })),
    })));
  } catch (error) {
    next(error);
  }
};

exports.getTeamDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).lean();

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({
      ...team,
      id: team._id.toString(),
      createdBy: team.createdBy ? team.createdBy.toString() : null,
      members: team.members.map((member) => ({ ...member, userId: member.userId.toString() })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getTeamBoards = async (req, res, next) => {
  try {
    const { id } = req.params;
    const boards = await Board.find({ teamId: id }).sort({ createdAt: -1 }).lean();

    res.status(200).json(boards.map((board) => ({
      ...board,
      id: board._id.toString(),
      teamId: board.teamId ? board.teamId.toString() : null,
      createdBy: board.createdBy ? board.createdBy.toString() : null,
    })));
  } catch (error) {
    next(error);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isAdmin = team.members.some((member) => String(member.userId) === String(req.user.id) && member.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: { ...req.body } },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      ...updatedTeam.toObject(),
      id: updatedTeam._id.toString(),
      createdBy: updatedTeam.createdBy.toString(),
      members: updatedTeam.members.map((member) => ({ ...member, userId: member.userId.toString() })),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isAdmin = team.members.some((member) => String(member.userId) === String(req.user.id) && member.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await Team.findByIdAndDelete(id);
    await Board.deleteMany({ teamId: id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.inviteUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { id } = req.params;
    const targetUser = await User.findOne({ email: email?.trim().toLowerCase() });

    if (targetUser) {
      await Notification.create({
        userId: targetUser._id,
        type: 'team_invite',
        message: `You were invited to join team ${id}`,
        teamId: id,
        read: false,
      });
    }

    res.status(201).json({ message: 'Invitation sent' });
  } catch (error) {
    next(error);
  }
};

exports.acceptInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const notification = await Notification.findById(invitationId);

    if (!notification) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    const team = await Team.findById(notification.teamId);
    if (team) {
      const existingMember = team.members.some((member) => String(member.userId) === String(req.user.id));
      if (!existingMember) {
        team.members.push({ userId: req.user.id, role: 'member' });
        await team.save();
      }
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Joined team' });
  } catch (error) {
    next(error);
  }
};

exports.leaveTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.members = team.members.filter((member) => String(member.userId) !== String(req.user.id));
    await team.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isAdmin = team.members.some((member) => String(member.userId) === String(req.user.id) && member.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (req.body.action === 'remove') {
      team.members = team.members.filter((member) => String(member.userId) !== String(userId));
    } else if (req.body.role) {
      const member = team.members.find((entry) => String(entry.userId) === String(userId));
      if (member) {
        member.role = req.body.role;
      }
    }

    await team.save();
    res.status(200).json({
      ...team.toObject(),
      id: team._id.toString(),
      createdBy: team.createdBy.toString(),
      members: team.members.map((member) => ({ ...member, userId: member.userId.toString() })),
    });
  } catch (error) {
    next(error);
  }
};
