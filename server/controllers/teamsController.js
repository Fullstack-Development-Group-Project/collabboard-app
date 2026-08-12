const db = require('../data/memoryStore');

exports.createTeam = (req, res) => {
  const { name, description } = req.body;
  const newTeam = {
    id: "team" + Date.now(),
    name,
    description,
    members: [{ userId: req.user.id, role: "admin" }]
  };
  db.teams.push(newTeam);
  res.status(201).json(newTeam);
};

exports.getUserTeams = (req, res) => {
  const userTeams = db.teams.filter(t => t.members.some(m => m.userId === req.user.id));
  res.status(200).json(userTeams);
};

exports.getTeamDetails = (req, res) => {
  const { id } = req.params;
  const team = db.teams.find(t => t.id === id);
  if (!team) return res.status(404).json({ message: "Team not found" });
  res.status(200).json(team);
};

exports.getTeamBoards = (req, res) => {
  const { id } = req.params;
  const teamBoards = db.boards.filter(b => b.teamId === id);
  res.status(200).json(teamBoards);
};

exports.updateTeam = (req, res) => {
  const { id } = req.params;
  const teamIndex = db.teams.findIndex(t => t.id === id);
  
  if (teamIndex === -1) return res.status(404).json({ message: "Team not found" });
  
  // Basic admin check
  const isAdmin = db.teams[teamIndex].members.some(m => m.userId === req.user.id && m.role === "admin");
  if (!isAdmin) return res.status(403).json({ message: "Admin access required" });

  db.teams[teamIndex] = { ...db.teams[teamIndex], ...req.body };
  res.status(200).json(db.teams[teamIndex]);
};

exports.deleteTeam = (req, res) => {
  const { id } = req.params;
  const teamIndex = db.teams.findIndex(t => t.id === id);
  
  if (teamIndex === -1) return res.status(404).json({ message: "Team not found" });

  const isAdmin = db.teams[teamIndex].members.some(m => m.userId === req.user.id && m.role === "admin");
  if (!isAdmin) return res.status(403).json({ message: "Admin access required" });

  db.teams.splice(teamIndex, 1);
  // Also delete associated boards (in-memory cascade)
  db.boards = db.boards.filter(b => b.teamId !== id);
  
  res.status(204).send();
};

exports.inviteUser = (req, res) => {
  const { email } = req.body;
  // In a real app, send email with token. Here, mock notification.
  const targetUser = db.users.find(u => u.email === email);
  if (targetUser) {
    db.notifications.push({
      id: "notif" + Date.now(),
      userId: targetUser.id,
      type: "team_invite",
      message: `You were invited to join team ${req.params.id}`,
      teamId: req.params.id,
      read: false,
      createdAt: new Date().toISOString()
    });
  }
  res.status(201).json({ message: "Invitation sent" });
};

exports.acceptInvitation = (req, res) => {
  const { invitationId } = req.params;
  const notif = db.notifications.find(n => n.id === invitationId);
  if (!notif) return res.status(404).json({ message: "Invite not found" });

  const team = db.teams.find(t => t.id === notif.teamId);
  if (team) {
    team.members.push({ userId: req.user.id, role: "member" });
  }
  notif.read = true;
  res.status(200).json({ message: "Joined team" });
};

exports.leaveTeam = (req, res) => {
  const { id } = req.params;
  const team = db.teams.find(t => t.id === id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  team.members = team.members.filter(m => m.userId !== req.user.id);
  res.status(204).send();
};

exports.removeMember = (req, res) => {
  const { id, userId } = req.params;
  const team = db.teams.find(t => t.id === id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const isAdmin = team.members.some(m => m.userId === req.user.id && m.role === "admin");
  if (!isAdmin) return res.status(403).json({ message: "Admin access required" });

  if (req.body.action === "remove") {
    team.members = team.members.filter(m => m.userId !== userId);
  } else if (req.body.role) {
    const member = team.members.find(m => m.userId === userId);
    if (member) member.role = req.body.role;
  }
  
  res.status(200).json(team);
};
