# Chat Application Backend

## Setup
1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in MongoDB, JWT and Cloudinary credentials.
4. Run `npm run dev` or `npm start`.

## API endpoints
- `GET /health` – server health check
- `POST /api/create-profile` – register user; multipart fields: `fullName`, `username`, `password`, `gender`, optional `profilePic`
- `POST /api/login` – login; JSON: `username`, `password`
- `GET /api/profile` – current profile (Bearer token)
- `GET /api/users` – list other users (Bearer token)
- `GET /api/messages/conversations` – current user's conversations (Bearer token)
- `GET /api/messages/:userId` – message history with a user (Bearer token)
- `POST /api/messages/:userId` – send message; JSON: `message` (Bearer token)

## Socket.IO
Connect with `auth: { token: '<JWT>' }`. The server emits `getOnlineUsers` with an array of online user IDs and `newMessage` when a message is sent.
