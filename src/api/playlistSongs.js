const PlaylistSongsService = require('../service/playlistSongsService');
const PlaylistsService = require('../service/playlistsService');
const Joi = require('joi');

const service = new PlaylistSongsService();
const playlistsService = new PlaylistsService();

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const addSongToPlaylistHandler = async (request, h) => {
  const { error } = PlaylistSongPayloadSchema.validate(request.payload);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const { id: playlistId } = request.params;
  const { songId } = request.payload;
  const { userId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, userId);
  await service.addSongToPlaylist(playlistId, songId, userId);

  return h.response({
    status: 'success',
    message: 'Lagu berhasil ditambahkan ke playlist',
  }).code(201);
};

const getSongsFromPlaylistHandler = async (request, h) => {
  const { id: playlistId } = request.params;
  const { userId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, userId);
  const playlist = await service.getPlaylistWithSongs(playlistId);

  return h.response({
    status: 'success',
    data: { playlist },
  }).code(200);
};

const deleteSongFromPlaylistHandler = async (request, h) => {
  const { error } = PlaylistSongPayloadSchema.validate(request.payload);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const { id: playlistId } = request.params;
  const { songId } = request.payload;
  const { userId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, userId);
  await service.deleteSongFromPlaylist(playlistId, songId, userId);

  return h.response({
    status: 'success',
    message: 'Lagu berhasil dihapus dari playlist',
  }).code(200);
};

const getPlaylistActivitiesHandler = async (request, h) => {
  const { id: playlistId } = request.params;
  const { userId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, userId);
  const activities = await service.getActivities(playlistId);

  return h.response({
    status: 'success',
    data: {
      playlistId,
      activities,
    },
  }).code(200);
};

module.exports = {
  addSongToPlaylistHandler,
  getSongsFromPlaylistHandler,
  deleteSongFromPlaylistHandler,
  getPlaylistActivitiesHandler,
};