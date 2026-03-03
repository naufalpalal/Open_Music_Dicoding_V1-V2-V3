require('dotenv').config();
const Hapi = require('@hapi/hapi');

const {
    addAlbumHandler,
    getAlbumByIdHandler,
    putAlbumByIdHandler,
    deleteAlbumByIdHandler,
} = require('./api/albums.js');

const {
    addSongHandler,
    getSongsHandler,
    getSongByIdHandler,
    editSongByIdHandler,
    deleteSongByIdHandler,
} = require('./api/songs.js');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost',
        routes: {
            cors: { origin: ['*'] }
        },
    });

    server.route([
        { method: 'POST', path: '/albums', handler: addAlbumHandler },
        { method: 'GET', path: '/albums/{id}', handler: getAlbumByIdHandler },
        { method: 'PUT', path: '/albums/{id}', handler: putAlbumByIdHandler },
        { method: 'DELETE', path: '/albums/{id}', handler: deleteAlbumByIdHandler },

        { method: 'POST', path: '/songs', handler: addSongHandler },
        { method: 'GET', path: '/songs', handler: getSongsHandler },
        { method: 'GET', path: '/songs/{id}', handler: getSongByIdHandler },
        { method: 'PUT', path: '/songs/{id}', handler: editSongByIdHandler },
        { method: 'DELETE', path: '/songs/{id}', handler: deleteSongByIdHandler },
    ]);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

init();