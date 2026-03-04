const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('./postger');

class UsersService {
  async addUser({ username, password, fullname }) {
    const check = await pool.query(
      'SELECT username FROM users WHERE username = $1',
      [username]
    );

    if (check.rowCount > 0) {
      throw new Error('Username sudah digunakan');
    }

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users VALUES($1,$2,$3,$4)',
      [id, username, hashedPassword, fullname]
    );

    return id;
  }

  async verifyUserCredential(username, password) {
    const result = await pool.query(
      'SELECT id, password FROM users WHERE username = $1',
      [username]
    );

    if (!result.rowCount) {
      throw new Error('Kredensial salah');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new Error('Kredensial salah');
    }

    return id;
  }
}

module.exports = UsersService;
