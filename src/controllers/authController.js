const { validationResult } = require('express-validator');
const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const { user, passwordMatch } = await authService.login(email, password);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no registrado' });
      }

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Guardar usuario en sesión
      req.session.user = {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      };

      res.json({
        message: 'Login exitoso',
        user: req.session.user
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await authService.register(email, password);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al cerrar sesión' });
      }
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  }

  async getProfile(req, res) {
    if (!req.session.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    res.json({ user: req.session.user });
  }
}

module.exports = new AuthController();