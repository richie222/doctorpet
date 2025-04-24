const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middlewares/auth');

const router = express.Router();

// Validaciones comunes
const emailPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Rutas
router.post('/register', isGuest, emailPasswordValidation, authController.register);
router.post('/login', isGuest, emailPasswordValidation, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/profile', isAuthenticated, authController.getProfile);

module.exports = router;