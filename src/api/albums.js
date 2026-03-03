const { nanoid } = require('nanoid');
const pool = require('../service/postger.js');
const AlbumsValidator = require('../validator/albums.js');

const addAlbumHandler = async (request, h) => {
  try {
    AlbumsValidator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const id = `album-${nanoid(16)}`;

    await pool.query(
      'INSERT INTO albums(id, name, year) VALUES($1,$2,$3)',
      [id, name, year]
    );

    return h.response({
      status: 'success',
      data: { albumId: id },
    }).code(201);

  } catch (error) {
    if (error.statusCode === 400) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(400);
    }

    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }
};

const getAlbumByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;

    const albumResult = await pool.query('SELECT * FROM albums WHERE id=$1', [id]);

    if (!albumResult.rowCount) {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }

    const songsResult = await pool.query(
      'SELECT id, title, performer FROM songs WHERE album_id=$1',
      [id]
    );

    const album = albumResult.rows[0];
    album.songs = songsResult.rows;

    return h.response({
      status: 'success',
      data: { album },
    }).code(200);
    
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }
};

const putAlbumByIdHandler = async (request, h) => {
  try {
    AlbumsValidator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;

    const result = await pool.query(
      'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id',
      [name, year, id]
    );

    if (!result.rowCount) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui album. Id tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    }).code(200);

  } catch (error) {
    if (error.statusCode === 400) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(400);
    }

    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }
};

const deleteAlbumByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;

    const result = await pool.query(
      'DELETE FROM albums WHERE id=$1 RETURNING id',
      [id]
    );

    if (!result.rowCount) {
      return h.response({
        status: 'fail',
        message: 'Album gagal dihapus. Id tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    }).code(200);
    
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }
};

module.exports = {
  addAlbumHandler,
  getAlbumByIdHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
};
