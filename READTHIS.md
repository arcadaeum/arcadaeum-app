# READTHIS

## Environment Variables

Run this in the terminal after moving to the repo root folder:
`cp .env.example .env`

Everyone needs a .env file for the environment variables such as API keys and the database credentials.
These need to stay private so we will share them with each other off GitHub and then put them in the
.env file in the same format as the .env.example

## Requirements

#### Downloads

- Node.js
- Docker Desktop (includes docker compose)

#### Extensions

- Docker VScode extensions
- Prettier extension (Frontend formatting)
- Black Formatter extension (Backend formatting)
- ESLint
- Python extensions

## URLs

- Frontend: http://localhost:5173
- Backend health: http://localhost:8000/health
- Postgres: localhost:5432

## Run

This one command should be the only one you need to start everything:

- Start everything: `npm run start`
- Once Docker has loaded press "d" to detach the logs

This sets up the local development Python environment, composes the Docker container, and then prints the URLs

This is just extra stuff:

- Stop: `docker compose down` or `npm run stop`

- Reset: `docker compose down -v` or `npm run reset`

- Verify DB init: `npm run db:test`

## GitHub

Use branches for features, push to GitHub and make a merge request for to be merged into main 🤙🏻
