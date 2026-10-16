CREATE TABLE IF NOT EXISTS user_media_preferences (
  user_id VARCHAR(255) NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type VARCHAR(32) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title LONGTEXT NOT NULL,
  poster_path LONGTEXT,
  release_date LONGTEXT,
  to_watch BOOLEAN NOT NULL DEFAULT false,
  watched BOOLEAN NOT NULL DEFAULT false,
  user_rating SMALLINT CHECK (user_rating BETWEEN 1 AND 10),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, tmdb_id, media_type),
  FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
  INDEX user_media_preferences_to_watch_idx (user_id, to_watch, updated_at),
  INDEX user_media_preferences_watched_idx (user_id, watched, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
