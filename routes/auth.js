const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');

// login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// login req
router.post('/login', authController.login);

// create account page
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

// create account req
router.post('/register', authController.register);

module.exports = router;
