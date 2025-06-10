const express = require('express');
const controllerToros = require('../controllers/controllersToros');
const {authenticateToken} = require('../middlewares/authenticateToken');

const router = express.Router();

// Login Route
router.post('/login', controllerToros.login);
router.post('/logout', authenticateToken, controllerToros.logout);

//Users Routes
router.post('/register', controllerToros.registerUser);
router.get('/users', controllerToros.users);

//Seasons Routes
router.post('/seasons', authenticateToken, controllerToros.createSeason);
router.get('/seasons', controllerToros.listSeasons);
router.put('/seasons/:id', authenticateToken, controllerToros.editSeason );

//Games Routes
router.get('/games',controllerToros.listGames);
router.post('/games', authenticateToken, controllerToros.createGame);

//Players Offfensive Routes
router.post('/offensive-player-data', authenticateToken, controllerToros.createPlayerOffensive);
router.put('/offensive-player-data/:id', authenticateToken, controllerToros.updatePlayerOffensive);
router.get('/offensive-player-data', controllerToros.listPlayersOffensive);
router.get('/offensive-stats-by-season/:id_season', controllerToros.listPlayersOffensivebySeason);

module.exports = router;