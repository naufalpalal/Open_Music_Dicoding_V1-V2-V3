const UsersService = require('../service/usersService');
const { UserPayloadSchema } = require('../validator/users');

const service = new UsersService();

const addUserHandler = async (request, h) => {
  const { error } = UserPayloadSchema.validate(request.payload);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const userId = await service.addUser(request.payload);

  return h.response({
    status: 'success',
    data: { userId },
  }).code(201);
};

module.exports = { addUserHandler };