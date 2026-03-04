# Open Music API - Dicoding Submission

Proyek submission dari Dicoding kelas **Belajar Fundamental Back-End dengan JavaScript**.

## Fitur

### V1 - Basic CRUD
- Albums (Create, Read, Update, Delete)
- Songs (Create, Read, Update, Delete)
- Query parameter untuk filter songs (title, performer)

### V2 - Authentication & Playlists
- User Registration
- User Authentication (JWT)
- Playlists Management
- Playlist Songs Management
- Collaborations
- Playlist Activities

## Tech Stack
- Node.js
- Hapi.js
- PostgreSQL
- JWT Authentication
- Joi Validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database PostgreSQL dan buat database `openmusic`

3. Jalankan migrations:
```bash
npm run migrate up
```

4. Buat file `.env` dengan konfigurasi:
```
PORT=5000
HOST=localhost
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_password
PGDATABASE=openmusic
PGPORT=5432
ACCESS_TOKEN_KEY=your_access_token_secret_key
REFRESH_TOKEN_KEY=your_refresh_token_secret_key
```

5. Jalankan server:
```bash
npm start
```

## API Endpoints

### Users
- POST `/users` - Register user baru

### Authentications
- POST `/authentications` - Login
- PUT `/authentications` - Refresh token
- DELETE `/authentications` - Logout

### Albums
- POST `/albums` - Tambah album
- GET `/albums/{id}` - Get album by ID
- PUT `/albums/{id}` - Update album
- DELETE `/albums/{id}` - Delete album

### Songs
- POST `/songs` - Tambah lagu
- GET `/songs` - Get all songs (support query: title, performer)
- GET `/songs/{id}` - Get song by ID
- PUT `/songs/{id}` - Update song
- DELETE `/songs/{id}` - Delete song

### Playlists (Requires Authentication)
- POST `/playlists` - Buat playlist
- GET `/playlists` - Get user playlists
- DELETE `/playlists/{id}` - Delete playlist

### Playlist Songs (Requires Authentication)
- POST `/playlists/{id}/songs` - Tambah lagu ke playlist
- GET `/playlists/{id}/songs` - Get songs dari playlist
- DELETE `/playlists/{id}/songs` - Hapus lagu dari playlist

### Playlist Activities (Requires Authentication)
- GET `/playlists/{id}/activities` - Get playlist activities

### Collaborations (Requires Authentication)
- POST `/collaborations` - Tambah kolaborator
- DELETE `/collaborations` - Hapus kolaborator

## Testing

Gunakan Postman collection yang tersedia di folder:
- `OpenMusic API V1 Test/`
- `OpenMusic API V2 Test/`
