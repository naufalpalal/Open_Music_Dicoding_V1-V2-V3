const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
});

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const { error } = AlbumPayloadSchema.validate(payload);

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
  },
};

module.exports = AlbumsValidator;