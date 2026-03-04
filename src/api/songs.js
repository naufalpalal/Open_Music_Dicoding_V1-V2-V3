const { nanoid } = require('nanoid');
const pool = require('../service/postger.js');
const SongsValidator = require('../validator/songs.js');

const addSongHandler = async (request, h) => {
    SongsValidator.validateSongPayload(request.payload);

    const { title, year, performer, genre, duration, albumId } = request.payload;
    const id = `song-${nanoid(16)}`;

    if (albumId) {
        const albumCheck = await pool.query('SELECT id FROM albums WHERE id=$1', [albumId]);
        if (!albumCheck.rowCount) {
            throw new Error('Gagal menambahkan lagu. albumId tidak ditemukan');
        }
    }

    await pool.query(
        'INSERT INTO songs(id, title, year, performer, genre, duration, album_id) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [id, title, year, performer, genre, duration, albumId || null]
    );

    return h.response({
        status: 'success',
        data: { songId: id },
    }).code(201);
};

const getSongsHandler = async (request, h) => {
    const { title, performer } = request.query;

    let queryText = 'SELECT id, title, performer FROM songs';
    const values = [];
    const conditions = [];

    if (title) {
        values.push(`%${title}%`);
        conditions.push(`title ILIKE $${values.length}`);
    }

    if (performer) {
        values.push(`%${performer}%`);
        conditions.push(`performer ILIKE $${values.length}`);
    }

    if (conditions.length) {
        queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await pool.query(queryText, values);

    return h.response({
        status: 'success',
        data: {
            songs: result.rows,
        },
    }).code(200);
};

const getSongByIdHandler = async (request, h) => {
    const { id } = request.params;

    const result = await pool.query(
        'SELECT id, title, year, performer, genre, duration, album_id as "albumId" FROM songs WHERE id=$1',
        [id]
    );

    if (!result.rowCount) {
        throw new Error('Lagu tidak ditemukan');
    }

    return h.response({
        status: 'success',
        data: { song: result.rows[0] },
    }).code(200);
};

const editSongByIdHandler = async (request, h) => {
    const { id } = request.params;
    const checkSong = await pool.query('SELECT id FROM songs WHERE id=$1', [id]);
    
    if (!checkSong.rowCount) {
        throw new Error('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    SongsValidator.validateSongPayload(request.payload);

    const { title, year, performer, genre, duration, albumId } = request.payload;

    if (albumId) {
        const albumCheck = await pool.query('SELECT id FROM albums WHERE id=$1', [albumId]);
        if (!albumCheck.rowCount) {
            throw new Error('Gagal memperbarui lagu. albumId tidak ditemukan');
        }
    }

    await pool.query(
        'UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id=$7',
        [title, year, performer, genre, duration, albumId || null, id]
    );

    return h.response({
        status: 'success',
        message: 'Lagu berhasil diperbarui',
    }).code(200);
};

const deleteSongByIdHandler = async (request, h) => {
    const { id } = request.params;

    const result = await pool.query('DELETE FROM songs WHERE id=$1 RETURNING id', [id]);

    if (!result.rowCount) {
        throw new Error('Lagu gagal dihapus. Id tidak ditemukan');
    }

    return h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus',
    }).code(200);
};

module.exports = {
    addSongHandler,
    getSongsHandler,
    getSongByIdHandler,
    editSongByIdHandler,
    deleteSongByIdHandler,
};
