const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

class AuthService {
  async login(email, password) {
    // Buscar usuario
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      // Retorna null si no existe
      return { user: null, passwordMatch: false };
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    return { user, passwordMatch: isValidPassword };
  }

  async register(email, password, profileImage) {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser(email, hashedPassword, profileImage);
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

}

module.exports = new AuthService()