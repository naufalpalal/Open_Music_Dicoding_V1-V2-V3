const PlaylistsService = require('../service/playlistsService');
const { PlaylistPayloadSchema } = require('../validator/playlists');

const service = new PlaylistsService();

const addPlaylistHandler = async (request, h) => {
  const { error } = PlaylistPayloadSchema.validate(request.payload);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const { name } = request.payload;
  const { userId } = request.auth.credentials;

  const playlistId = await service.addPlaylist(name, userId);

  return h.response({
    status: 'success',
    data: { playlistId },
  }).code(201);
};

const getPlaylistsHandler = async (request, h) => {
  const { userId } = request.auth.credentials;
  const playlists = await service.getPlaylists(userId);

  return h.response({
    status: 'success',
    data: { playlists },
  }).code(200);
};

const deletePlaylistHandler = async (request, h) => {
  const { id } = request.params;
  const { userId } = request.auth.credentials;

  await service.verifyPlaylistOwner(id, userId);
  await service.deletePlaylist(id, userId);

  return h.response({
    status: 'success',
    message: 'Playlist berhasil dihapus',
  }).code(200);
};

module.exports = {
  addPlaylistHandler,
  getPlaylistsHandler,
  deletePlaylistHandler,
};