const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number().integer(),
  albumId: Joi.string(),
});

const SongsValidator = {
  validateSongPayload: (payload) => {
    const { error } = SongPayloadSchema.validate(payload);

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
  },
};

module.exports = SongsValidator;
