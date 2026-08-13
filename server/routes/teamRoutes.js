const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', teamsController.getUserTeams);
router.post('/', teamsController.createTeam);
router.get('/:id', teamsController.getTeamDetails);
router.put('/:id', teamsController.updateTeam);
router.delete('/:id', teamsController.deleteTeam);

router.get('/:id/boards', teamsController.getTeamBoards);
router.post('/:id/invitations', teamsController.inviteUser);
router.delete('/:id/members/me', teamsController.leaveTeam);
router.put('/:id/members/:userId', teamsController.removeMember);

// Acceptance is global or parameter-based
router.post('/invitations/:invitationId/accept', teamsController.acceptInvitation);

module.exports = router;
