// server/routes/authRoutes.js
const express = require('express');
const { signup, login, getMe } = require('../controllers/authController.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;