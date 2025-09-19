# Using MongoDB Atlas

To run EvalSuite against MongoDB Atlas instead of local MongoDB:

1) Create a `.env` file at the project root (sibling of `server/`). The server loads `../.env` by default.

Required variables:

- MONGODB_URI: your Atlas connection string
- MONGODB_DB (optional but recommended): database name to use

Example:

MONGODB_URI=mongodb+srv://chhayakantdash:<db_password>@cluster0.hk7d3iz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=evalsuite

2) Ensure your Atlas IP Access List allows your machine/server.

3) Install server deps and start:

cd server
npm install
npm run init   # one-time to seed initial event, optional if already seeded
npm start

Notes
- Passwords are masked in logs.
- Passing MONGODB_DB will select that DB even if the URI omits a path.
- Both `server.js` and `scripts/initializeDatabase.js` honor these env vars.
