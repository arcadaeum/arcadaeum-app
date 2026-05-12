# Arcadaeum

Arcadaeum is a web-based social game logging and discovery platform inspired by services such as Letterboxd and Fable, but focused on video games.
A social game-logging and discovery platform.

Live: https://www.arcadaeum.com/

Development Blog: https://arcadaeum-dev-blog.blogspot.com/

<img width="1421" height="697" alt="Screenshot 2026-05-12 at 13 12 45" src="https://github.com/user-attachments/assets/5ca4a9e0-0294-4c10-9733-1fd193fd0aab" />

---

## Overview

Arcadaeum is a modern web application for discovering, logging, reviewing and sharing video games. The platform reduces friction when adding games by integrating with Steam and IGDB, encourages genuine social interactions via reviews and collections and is built to scale dynamically as the player base increases.

This repository contains the codebase for the Arcadaeum frontend and backend, plus infrastructure and tests.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Testing & CI/CD](#testing--cicd)
- [Data & External APIs](#data--external-apis)
- [Design for Scale](#design-for-scale)
- [Security & Secrets](#security--secrets)
- [Authors](#authors)
- [Website](#website)

## Features

- Authentication: Email/password with secure hashing, JWT sessions and OAuth (Google). Steam library syncing supported.
- User profiles: Customisable profiles with bio, avatar, favourite games and activity feeds.
- Game logging: Add games manually or import from Steam; create collections and lists; write reviews and rate games.
- Game catalogue: Cached popular games from IGDB, on-demand lookups and scheduled metadata refreshes.
- Reviews & ratings: Create, edit and delete reviews; aggregated game statistics.
- Moderation: Admin tools to remove inappropriate content.
- System management: Logging, error handling and secure secret management.

## Tech Stack

- Frontend: React + TypeScript, Vite, Tailwind CSS, Radix UI, React Router, Framer Motion.
- Backend: FastAPI (Python), Authlib for OAuth, JWT for authentication.
- Database: PostgreSQL with carefully-designed schema and indices.
- Infrastructure: Docker Compose for local development; production deploys on DigitalOcean (backend) and Vercel (frontend).

## Architecture

The project is split into three primary services, each running in its own Docker container:

- Frontend: Single-page application built with React and TypeScript.
- Backend: FastAPI service exposing REST endpoints, handling authentication and coordinating external API calls.
- Database: PostgreSQL storing users, games, reviews, posts, collections and relationships.

Services communicate over HTTP; external dependencies (IGDB, Steam) are accessed from the backend and results are cached where appropriate.

## Testing & CI/CD

- Frontend tests: Vitest + React Testing Library.
- Backend tests: Pytest + Unittest.
- Linting: ESLint (frontend) and Ruff (backend).
- CI: GitHub Actions run tests, linters and formatters on every commit. Pull requests require two developer approvals.

Production deployment is automated: merges to `main` trigger deployments. DigitalOcean for the backend and Vercel for the frontend via GitHub Actions.

## Data & External APIs

- IGDB: Used for game metadata. We cache 500 popular games at startup and refresh metadata older than 30 days.
- Steam Web API: Used for library imports and library syncs. Requests are rate-limited; we implement retries and backoff strategies.
- Scheduler: Periodically syncs active users' Steam libraries to spread external load.

When external services are unavailable we fall back to cached data and surface helpful error messages instead of failing hard.

## Design for Scale

- Normalised and indexed database schema for efficient queries.
- Pagination for large datasets; aggressive caching for external API responses.
- Docker-based architecture allows independent scaling of frontend, backend and database.

## Security & Secrets

- API keys and credentials are stored in GitHub Secrets / environment variables and are never committed.
- Passwords are hashed securely; JWT tokens manage sessions.
- Critical events are logged for debugging and audits.

## Authors

Written by Elliott Feltham, Archie Sagers, Fred Stonnell, Lennick Richardson, Hirak Das

## Website

Visit the live site at: https://www.arcadaeum.com/

---
