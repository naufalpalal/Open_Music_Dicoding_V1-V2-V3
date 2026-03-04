const { nanoid } = require('nanoid');
const pool = require('./postger');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    const checkUser = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (!checkUser.rowCount) {
      throw new Error('User tidak ditemukan');
    }

    const id = `collab-${nanoid(16)}`;

    await pool.query(
      'INSERT INTO collaborations VALUES($1, $2, $3)',
      [id, playlistId, userId]
    );

    return id;
  }

  async deleteCollaboration(playlistId, userId) {
    const result = await pool.query(
      'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      [playlistId, userId]
    );

    if (!result.rowCount) {
      throw new Error('Kolaborasi tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;
