// server/routes/teamRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Team routes can be expanded later
router.get('/', (req, res) => {
  res.json({ message: 'Teams endpoint' });
});

module.exports = router;