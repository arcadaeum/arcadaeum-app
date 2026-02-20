## API Routes for MVP

1. **Auth**
    - `POST /auth/register`: Register a new user (inputs: email, password, username).
    - `POST /auth/login`: Log in a user (inputs: email, password).
    - `GET /auth/me`: Get the current user's details (requires authentication).

2. **Games**
    - `GET /games/search`: Search for games (inputs: query string, optional filters).
    - `GET /games/{id}`: Get details for a specific game (inputs: game ID).

3. **Library**
    - `GET /library`: Get the user's game library.
    - `POST /library`: Add a game to the user's library.
    - `PUT /library/{id}`: Update a game in the user's library.
    - `DELETE /library/{id}`: Remove a game from the user's library.

4. **Reviews**
    - `GET /reviews`: Get all reviews for a game.
    - `POST /reviews`: Add a review for a game.
    - `PUT /reviews/{id}`: Update a review.
    - `DELETE /reviews/{id}`: Delete a review.

## Database Schema

1. **Users**
    - `id`: Primary key
    - `email`: Unique
    - `password`: Hashed
    - `username`: Unique
    - `created_at`: Timestamp

2. **Games**
    - `id`: Primary key
    - `title`: Game title
    - `description`: Game description
    - `release_date`: Date
    - `platforms`: JSON array of platforms
    - `created_at`: Timestamp

3. **Library**
    - `id`: Primary key
    - `user_id`: Foreign key to Users
    - `game_id`: Foreign key to Games
    - `added_at`: Timestamp

4. **Reviews**
    - `id`: Primary key
    - `user_id`: Foreign key to Users
    - `game_id`: Foreign key to Games
    - `rating`: Integer (1-5)
    - `review_text`: Text
    - `created_at`: Timestamp

## IGDB and Steam API

1. **Steps Before Integration**
    - Set up a database table for caching game data.
    - Populate the table with the most popular games (seed data).
    - Define the fields we need to store (e.g., title, description, platforms).

2. **Integration Plan**
    - Use the IGDB API for game search and details.
    - Use the Steam API for additional metadata (e.g., pricing, reviews).
    - Cache results in our database to reduce API calls and improve performance.

3. **Challenges**
    - API rate limits: Ensure we stay within the limits of IGDB and Steam APIs.
    - Data consistency: Decide how often to refresh cached data.

## Frontend Priorities

1. **Sign-In Page** (High Priority)
    - Create a form for email and password input.
    - Add validation for inputs.
    - Connect the form to the `/auth/login` API route.

2. **User Dashboard Page** (Medium Priority)
    - Display the user's library (fetch from `/library`).
    - Add a button to add new games to the library.
    - Show the user's reviews.

3. **Homepage** (High Priority)
    - Add a navigation bar with login/sign-up options.
    - Display a welcome message or featured games.
    - Add a "Search Games" section connected to `/games/search`.

4. **Reusable Components**
    - Create reusable components for buttons, forms, and modals.

## Next Steps

### Backend:

- Finalize the database schema.
- Implement the authentication routes (/auth/register, /auth/login, /auth/me).
- Implement the /games/search and /games/{id} routes using the IGDB API as fallback for games not in our DB.
- Implement the library CRUD routes.
- Write unit tests for the backend.

### Frontend:

- Build the sign-in page and connect it to the backend.
- Build the homepage with login options and a game search bar.
- Build the user dashboard to display the library and reviews.
- Create reusable components (e.g., buttons, forms).
