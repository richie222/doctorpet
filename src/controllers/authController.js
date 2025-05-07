const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const fs = require('fs').promises;
const path = require('path');

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
        return res.status(401).json({ error: 'Usuario inválido' });
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
        // Si hay un archivo subido, eliminarlo
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const profileImage = req.file ? req.file.filename : null;

      const user = await authService.register(email, password, profileImage);

      // Si todo va bien, devolver respuesta
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          ...user,
          profileImageUrl: profileImage ? `/uploads/profile-images/${profileImage}` : null
        }
      });

    } catch (error) {
      // Si hay error al subir la imagen, eliminarla
      if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error al eliminar archivo:', err);
        });
      }

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