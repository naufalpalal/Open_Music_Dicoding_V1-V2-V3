const jwt = require('jsonwebtoken');
const UsersService = require('../service/usersService');
const AuthenticationsService = require('../service/authenticationsService');
const { AuthPayloadSchema, RefreshTokenSchema } = require('../validator/authentications');

const usersService = new UsersService();
const authService = new AuthenticationsService();

const postAuthenticationHandler = async (request, h) => {
    const { error } = AuthPayloadSchema.validate(request.payload);
    if (error) {
        const err = new Error(error.message);
        err.statusCode = 400;
        throw err;
    }

    const { username, password } = request.payload;
    // verifyUserCredential harus melempar Error dengan kata kunci "Kredensial" agar jadi 401
    const userId = await usersService.verifyUserCredential(username, password);

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);

    await authService.addToken(refreshToken);

    return h.response({
        status: 'success',
        data: { accessToken, refreshToken },
    }).code(201); // Login sukses harus 201
};

const putAuthenticationHandler = async (request, h) => {
    const { error } = RefreshTokenSchema.validate(request.payload);
    if (error) {
        const err = new Error(error.message);
        err.statusCode = 400;
        throw err;
    }

    const { refreshToken } = request.payload;
    await authService.verifyToken(refreshToken);

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });

    return {
        status: 'success',
        data: { accessToken },
    };
};

const deleteAuthenticationHandler = async (request, h) => {
    const { error } = RefreshTokenSchema.validate(request.payload);
    if (error) {
        const err = new Error(error.message);
        err.statusCode = 400;
        throw err;
    }

    const { refreshToken } = request.payload;
    await authService.verifyToken(refreshToken); // Pastikan token valid sebelum dihapus
    await authService.deleteToken(refreshToken);

    return {
        status: 'success',
        message: 'Refresh token berhasil dihapus',
    };
};

module.exports = { postAuthenticationHandler, putAuthenticationHandler, deleteAuthenticationHandler };