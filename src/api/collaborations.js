const CollaborationsService = require('../service/collaborationsService');
const PlaylistsService = require('../service/playlistsService');
const Joi = require('joi');

const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService();

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

const addCollaborationHandler = async (request, h) => {
  const { error } = CollaborationPayloadSchema.validate(request.payload);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const { playlistId, userId } = request.payload;
  const { userId: ownerId } = request.auth.credentials;

  await playlistsService.verifyPlaylistOwner(playlistId, ownerId);
  const collaborationId = await collaborationsService.addCollaboration(playlistId, userId);

  return h.response({
    status: 'success',
    data: { collaborationId },
  }).code(201);
};

const deleteCollaborationHandler = async (request, h) => {
  const { error } = CollaborationPayloadSchema.validate(request.payload);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const { playlistId, userId } = request.payload;
  const { userId: ownerId } = request.auth.credentials;

  await playlistsService.verifyPlaylistOwner(playlistId, ownerId);
  await collaborationsService.deleteCollaboration(playlistId, userId);

  return h.response({
    status: 'success',
    message: 'Kolaborasi berhasil dihapus',
  }).code(200);
};

module.exports = {
  addCollaborationHandler,
  deleteCollaborationHandler,
};
