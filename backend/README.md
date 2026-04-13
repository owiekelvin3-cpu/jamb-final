# Backend Setup

This backend uses Express and MongoDB with Mongoose.

## Install dependencies

```bash
cd backend
npm install
```

## Configure MongoDB

Copy `.env.example` to `.env` and set your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.weqr0bt.mongodb.net/?appName=Cluster0
```

If your network blocks SRV DNS lookups, use the standard connection string from MongoDB Atlas instead of `mongodb+srv://`.

If you want to use a plain host/port configuration instead, set these values instead of `MONGODB_URI`:

```env
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB=jamb-backend
MONGODB_USER=<username>
MONGODB_PASS=<password>
```

## Run backend

```bash
npm start
```

## Troubleshooting

- `querySrv ECONNREFUSED`: typically a DNS or network issue.
  - Make sure your Atlas cluster host is correct.
  - Add your local IP in Atlas Network Access.
  - Allow DNS SRV lookups on your network.
  - If the problem persists, use the plain `mongodb://` connection string shown by Atlas.

- `Missing MONGODB_URI environment variable.`: means `.env` is not configured or not loaded.

If you want, I can also help you switch the backend to a non-SRV Atlas connection string format.