const { nanoid } = require('nanoid');
const pool = require('./postger');

class PlaylistsService {
    async verifyPlaylistOwner(id, owner) {
        const result = await pool.query(
            'SELECT owner FROM playlists WHERE id = $1',
            [id]
        );

        if (!result.rowCount) {
            throw new Error('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new Error('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        const checkPlaylist = await pool.query(
            'SELECT id FROM playlists WHERE id = $1',
            [playlistId]
        );

        if (!checkPlaylist.rowCount) {
            throw new Error('Playlist tidak ditemukan');
        }

        const result = await pool.query(
            `SELECT playlists.id FROM playlists
             LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
             WHERE playlists.id = $1 AND (playlists.owner = $2 OR collaborations.user_id = $2)`,
            [playlistId, userId]
        );

        if (!result.rowCount) {
            throw new Error('Anda tidak berhak mengakses resource ini');
        }
    }
    async addPlaylist(name, owner) {
        const id = `playlist-${nanoid(16)}`;

        await pool.query(
            'INSERT INTO playlists VALUES($1,$2,$3)',
            [id, name, owner]
        );

        return id;
    }

    async getPlaylists(owner) {
        const result = await pool.query(
            `SELECT DISTINCT playlists.id, playlists.name, users.username
             FROM playlists
             LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
             JOIN users ON users.id = playlists.owner
             WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            [owner]
        );

        return result.rows;
    }

    async deletePlaylist(id, owner) {
        const result = await pool.query(
            'DELETE FROM playlists WHERE id = $1 AND owner = $2 RETURNING id',
            [id, owner]
        );

        if (!result.rowCount) {
            throw new Error('Playlist tidak ditemukan');
        }
    }
}

module.exports = PlaylistsService;
