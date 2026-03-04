const pool = require('./postger');

class AuthenticationsService {
  async addToken(token) {
    await pool.query(
      'INSERT INTO authentications VALUES($1)',
      [token]
    );
  }

  async verifyToken(token) {
    const result = await pool.query(
      'SELECT token FROM authentications WHERE token = $1',
      [token]
    );

    if (!result.rowCount) {
      const err = new Error('Refresh token tidak ditemukan');
      err.statusCode = 400;
      throw err;
    }
  }

  async deleteToken(token) {
    const result = await pool.query(
      'DELETE FROM authentications WHERE token = $1 RETURNING token',
      [token]
    );

    if (!result.rowCount) {
      const err = new Error('Refresh token tidak ditemukan');
      err.statusCode = 400;
      throw err;
    }
  }
}

module.exports = AuthenticationsService;
