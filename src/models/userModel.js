const {poolConnection} = require('../config/dababase'); // Asegúrate de exportar el pool en database.js

class UserModel {
  async createUser(email, hashedPassword, profileImage) {
    const result = await poolConnection.query(
      'INSERT INTO users (email, password, profile_image) VALUES ($1, $2, $3) RETURNING id, email, profile_image, created_at',
      [email, hashedPassword, profileImage]
    );
    return result.rows[0];
  }

  async findUserByEmail(email) {
    const result = await poolConnection.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async findUserById(id) {
    const result = await poolConnection.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

}

module.exports = new UserModel();