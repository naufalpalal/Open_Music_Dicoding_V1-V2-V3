require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Import semua handler
const { addUserHandler } = require('./api/users');
const { addAlbumHandler, getAlbumByIdHandler, putAlbumByIdHandler, deleteAlbumByIdHandler } = require('./api/albums.js');
const { addSongHandler, getSongsHandler, getSongByIdHandler, editSongByIdHandler, deleteSongByIdHandler } = require('./api/songs');
const { postAuthenticationHandler, putAuthenticationHandler, deleteAuthenticationHandler } = require('./api/authentications');
const { addPlaylistHandler, getPlaylistsHandler, deletePlaylistHandler } = require('./api/playlists');
const { addSongToPlaylistHandler, getSongsFromPlaylistHandler, deleteSongFromPlaylistHandler, getPlaylistActivitiesHandler } = require('./api/playlistSongs');
const { addCollaborationHandler, deleteCollaborationHandler } = require('./api/collaborations');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost',
        routes: { cors: { origin: ['*'] } },
    });

    await server.register(Jwt);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: { aud: false, iss: false, sub: false, maxAgeSec: 3600 },
        validate: (artifacts) => ({
            isValid: true,
            credentials: { userId: artifacts.decoded.payload.userId },
        }),
    });

    server.route([
        { method: 'POST', path: '/users', handler: addUserHandler },
        { method: 'POST', path: '/authentications', handler: postAuthenticationHandler },
        { method: 'PUT', path: '/authentications', handler: putAuthenticationHandler },
        { method: 'DELETE', path: '/authentications', handler: deleteAuthenticationHandler },
        { method: 'POST', path: '/albums', handler: addAlbumHandler },
        { method: 'GET', path: '/albums/{id}', handler: getAlbumByIdHandler },
        { method: 'PUT', path: '/albums/{id}', handler: putAlbumByIdHandler },
        { method: 'DELETE', path: '/albums/{id}', handler: deleteAlbumByIdHandler },
        { method: 'POST', path: '/songs', handler: addSongHandler },
        { method: 'GET', path: '/songs', handler: getSongsHandler },
        { method: 'GET', path: '/songs/{id}', handler: getSongByIdHandler },
        { method: 'PUT', path: '/songs/{id}', handler: editSongByIdHandler },
        { method: 'DELETE', path: '/songs/{id}', handler: deleteSongByIdHandler },
        { method: 'POST', path: '/playlists', handler: addPlaylistHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'GET', path: '/playlists', handler: getPlaylistsHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'DELETE', path: '/playlists/{id}', handler: deletePlaylistHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'POST', path: '/playlists/{id}/songs', handler: addSongToPlaylistHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'GET', path: '/playlists/{id}/songs', handler: getSongsFromPlaylistHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'DELETE', path: '/playlists/{id}/songs', handler: deleteSongFromPlaylistHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'GET', path: '/playlists/{id}/activities', handler: getPlaylistActivitiesHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'POST', path: '/collaborations', handler: addCollaborationHandler, options: { auth: 'openmusic_jwt' } },
        { method: 'DELETE', path: '/collaborations', handler: deleteCollaborationHandler, options: { auth: 'openmusic_jwt' } },
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            // 1. Handle Custom Error dengan statusCode (dari validator) - PRIORITAS TERTINGGI
            if (response.statusCode) {
                return h.response({
                    status: 'fail',
                    message: response.message,
                }).code(response.statusCode);
            }

            // 2. Handle Boom Error (termasuk Joi validation & JWT)
            if (response.isBoom) {
                const statusCode = response.output.statusCode;
                const message = response.message;
                
                // Jika statusCode 500, cek pesan untuk tentukan status code yang tepat
                if (statusCode === 500) {
                    if (message.toLowerCase().includes('tidak ditemukan')) return h.response({ status: 'fail', message }).code(404);
                    if (message.includes('tidak berhak') || message.includes('akses resource')) return h.response({ status: 'fail', message }).code(403);
                    if (message.includes('Kredensial') || message.includes('token tidak valid')) return h.response({ status: 'fail', message }).code(401);
                    if (message.includes('sudah digunakan') || message.includes('gagal')) return h.response({ status: 'fail', message }).code(400);
                }
                
                return h.response({
                    status: 'fail',
                    message: message,
                }).code(statusCode);
            }

            // 3. Handle Error berdasarkan pesan
            const message = response.message || '';
            
            // Not Found (404)
            if (message.toLowerCase().includes('tidak ditemukan') || message.toLowerCase().includes('not found')) {
                return h.response({ status: 'fail', message }).code(404);
            }
            
            // Forbidden (403)
            if (message.includes('tidak berhak') || message.includes('akses resource')) {
                return h.response({ status: 'fail', message }).code(403);
            }
            
            // Unauthorized (401)
            if (message.includes('Kredensial') || message.includes('refresh token') || message.includes('tidak valid')) {
                return h.response({ status: 'fail', message }).code(401);
            }
            
            // Bad Request (400)
            if (message.includes('sudah digunakan') || message.includes('sudah ada') || message.includes('gagal') || message.includes('required') || message.includes('must be')) {
                return h.response({ status: 'fail', message }).code(400);
            }

            // 4. Default: Server Error (500)
            console.error('Unhandled error:', message);
            return h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            }).code(500);
        }

        return response.continue || response;
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

init();