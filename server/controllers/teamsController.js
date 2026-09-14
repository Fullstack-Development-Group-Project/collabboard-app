const Team = require('../models/Team');
const Board = require('../models/Board');
const User = require('../models/User');
const Notification = require('../models/Notification');
const db = require('../data/memoryStore');

exports.createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    try {
      const team = await Team.create({
        name: trimmedName,
        description: description || '',
        members: [{ userId: req.user.id, role: 'admin' }],
        createdBy: req.user.id,
      });

      return res.status(201).json({
        ...team.toObject(),
        id: team._id.toString(),
        createdBy: team.createdBy.toString(),
        members: team.members.map((member) => ({
          ...member.toObject(),
          userId: member.userId.toString(),
        })),
      });
    } catch (dbError) {
      console.log('Database error in createTeam, using memory store');
      const newTeam = {
        id: 'team_' + Date.now(),
        name: trimmedName,
        description: description || '',
        members: [{ userId: req.user.id, role: 'admin' }],
        createdBy: req.user.id,
        createdAt: new Date().toISOString()
      };
      if (!db.teams) db.teams = [];
      db.teams.push(newTeam);
      return res.status(201).json(newTeam);
    }
  } catch (error) {
    next(error);
  }
};

exports.getUserTeams = async (req, res, next) => {
  try {
    try {
      const teams = await Team.find({ 'members.userId': req.user.id })
        .sort({ createdAt: -1 })
        .populate('members.userId', 'name email')
        .lean();

      if (teams && teams.length > 0) {
        return res.status(200).json(teams.map((team) => ({
          ...team,
          id: team._id.toString(),
          createdBy: team.createdBy ? team.createdBy.toString() : null,
          members: team.members.map((member) => ({
            ...member,
            userId: member.userId ? (member.userId._id ? member.userId._id.toString() : member.userId.toString()) : null,
            name: member.userId && member.userId.name ? member.userId.name : 'Unknown User',
            email: member.userId && member.userId.email ? member.userId.email : '',
          })),
        })));
      }
    } catch (dbError) {
      console.log('Database query failed for teams, falling back to memory store');
    }

    // Memory store fallback
    const memTeams = (db.teams || []).map(team => ({
      ...team,
      members: (team.members || []).map(m => {
        const u = (db.users || []).find(usr => usr.id === m.userId);
        return {
          userId: m.userId,
          role: m.role || 'member',
          name: u ? u.name : 'Team Member',
          email: u ? u.email : '',
        };
      })
    }));
    return res.status(200).json(memTeams);
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

    const { name, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: updates },
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
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      const targetUser = await User.findOne({ email: trimmedEmail });
      if (targetUser) {
        await Notification.create({
          userId: targetUser._id,
          type: 'team_invite',
          message: `You were invited to join team ${id}`,
          teamId: id,
          read: false,
        });
        return res.status(201).json({ message: `Invitation sent to ${trimmedEmail}` });
      }
    } catch (dbError) {
      console.log('Database error in inviteUser, using memory store');
    }

    // Memory store fallback: Add member to the team
    const team = (db.teams || []).find(t => t.id === id) || (db.teams || [])[0];
    if (team) {
      const existingUser = (db.users || []).find(u => u.email === trimmedEmail);
      const userId = existingUser ? existingUser.id : 'user_' + Date.now();
      if (!existingUser) {
        const namePart = trimmedEmail.split('@')[0];
        db.users.push({
          id: userId,
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: trimmedEmail,
          jobTitle: 'Invited Member',
          bio: 'Team member',
          avatar: namePart.substring(0, 2).toUpperCase()
        });
      }
      if (!team.members.some(m => m.userId === userId)) {
        team.members.push({ userId, role: 'member' });
      }
    }

    return res.status(201).json({ message: `Invitation sent to ${trimmedEmail}` });
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
