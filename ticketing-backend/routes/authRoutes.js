const express = require('express');
const router = express.Router();
const { login, me, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', login);       // POST /api/auth/login
router.get('/me', verifyToken, me); // GET  /api/auth/me
router.post('/logout', logout);     // POST /api/auth/logout

module.exports = router;