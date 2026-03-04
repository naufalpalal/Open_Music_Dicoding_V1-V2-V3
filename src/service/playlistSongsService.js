const { nanoid } = require('nanoid');
const pool = require('./postger');

class PlaylistSongsService {
  async addSongToPlaylist(playlistId, songId, userId) {
    const checkSong = await pool.query('SELECT id FROM songs WHERE id = $1', [songId]);
    if (!checkSong.rowCount) {
      throw new Error('Lagu tidak ditemukan');
    }

    const id = `playlist-song-${nanoid(16)}`;

    await pool.query(
      'INSERT INTO playlist_songs VALUES($1, $2, $3)',
      [id, playlistId, songId]
    );

    await this.addActivity(playlistId, songId, userId, 'add');

    return id;
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    await pool.query(
      'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action) VALUES($1, $2, $3, $4, $5)',
      [id, playlistId, songId, userId, action]
    );
  }

  async getPlaylistWithSongs(playlistId) {
    const playlistResult = await pool.query(
      `SELECT playlists.id, playlists.name, users.username
       FROM playlists
       JOIN users ON users.id = playlists.owner
       WHERE playlists.id = $1`,
      [playlistId]
    );

    if (!playlistResult.rowCount) {
      throw new Error('Playlist tidak ditemukan');
    }

    const songsResult = await pool.query(
      `SELECT songs.id, songs.title, songs.performer
       FROM songs
       JOIN playlist_songs ON songs.id = playlist_songs.song_id
       WHERE playlist_songs.playlist_id = $1`,
      [playlistId]
    );

    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
    };
  }

  async getSongsFromPlaylist(playlistId) {
    const result = await pool.query(
      `SELECT songs.id, songs.title, songs.performer
       FROM songs
       JOIN playlist_songs ON songs.id = playlist_songs.song_id
       WHERE playlist_songs.playlist_id = $1`,
      [playlistId]
    );

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const result = await pool.query(
      `DELETE FROM playlist_songs 
       WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      [playlistId, songId]
    );

    if (!result.rowCount) {
      throw new Error('Lagu tidak ditemukan di playlist');
    }

    await this.addActivity(playlistId, songId, userId, 'delete');
  }

  async getActivities(playlistId) {
    const result = await pool.query(
      `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
       FROM playlist_song_activities
       JOIN users ON users.id = playlist_song_activities.user_id
       JOIN songs ON songs.id = playlist_song_activities.song_id
       WHERE playlist_song_activities.playlist_id = $1
       ORDER BY playlist_song_activities.time ASC`,
      [playlistId]
    );

    return result.rows;
  }
}

module.exports = PlaylistSongsService;