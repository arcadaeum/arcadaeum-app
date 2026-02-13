CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title TEXT NOT NULL,
  genre TEXT NOT NULL
);

INSERT INTO users (name) VALUES
('Fred'),
('Archie'),
('Lennick');

INSERT INTO games (user_id, title, genre) VALUES
(1, 'Elden Ring', 'RPG'),
(1, 'World of Warcraft', 'MMO'),
(2, 'Minecraft', 'Sandbox'),
(3, 'Dating Simulator', 'Sim');
