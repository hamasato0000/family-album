-- ------------------------------------------------------------
-- Family Album: スキーマ
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 拡張機能：大文字小文字を区別しない文字列型
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS citext;

-- ------------------------------------------------------------
-- ENUM定義
-- ------------------------------------------------------------
CREATE TYPE content_type AS ENUM ('image', 'video');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE news_type AS ENUM ('upload', 'comment');

-- ------------------------------------------------------------
-- 性別
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_gender (
  gender_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  gender_name VARCHAR(10) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- ユーザー
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_users (
  user_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idp_user_id  TEXT UNIQUE NOT NULL,
  email        CITEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- アルバム
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_albums (
  album_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 子どもとの関係
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_child_relations (
  child_relation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  relation_name     VARCHAR(20) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- ユーザーアルバム（多対多）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_users_albums (
  user_album_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES r_users(user_id) ON DELETE CASCADE,
  album_id       BIGINT NOT NULL REFERENCES r_albums(album_id) ON DELETE CASCADE,
  role           user_role NOT NULL DEFAULT 'member',
  child_relation VARCHAR(20) NOT NULL, -- r_child_relationsへのリレーションは不要
  nickname       VARCHAR(50) NOT NULL,
  joined_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_albums_user_album ON r_users_albums(user_id, album_id);

-- ------------------------------------------------------------
-- 近況
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS e_news (
  news_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  album_id      BIGINT NOT NULL REFERENCES r_albums(album_id),
  news_type     news_type NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- アップロード
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS e_uploads (
  upload_id     BIGINT PRIMARY KEY REFERENCES e_news(news_id) ON DELETE CASCADE,
  uploader_id   BIGINT NOT NULL REFERENCES r_users(user_id),
  photo_count   BIGINT NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
  video_count   BIGINT NOT NULL DEFAULT 0 CHECK (video_count >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- コンテンツ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_contents (
  content_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  album_id      BIGINT NOT NULL REFERENCES r_albums(album_id),
  upload_id     BIGINT NOT NULL REFERENCES e_uploads(upload_id),
  content_type  content_type NOT NULL,
  content_hash  CHAR(64) UNIQUE NOT NULL,
  uri           TEXT UNIQUE NULL,
  storage_key   TEXT UNIQUE NOT NULL,
  caption       TEXT,
  taken_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 写真（コンテンツ と 1:1）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_photos (
  photo_id     BIGINT PRIMARY KEY REFERENCES r_contents(content_id) ON DELETE CASCADE,
  width        BIGINT NOT NULL,
  height       BIGINT NOT NULL,
  exif         JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 動画（コンテント と 1:1）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_videos (
  video_id          BIGINT PRIMARY KEY REFERENCES r_contents(content_id) ON DELETE CASCADE,
  duration_seconds  BIGINT NOT NULL,
  metadata          JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- コメント
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS e_comments (
  comment_id    BIGINT PRIMARY KEY REFERENCES e_news(news_id) ON DELETE CASCADE,
  content_id    BIGINT NOT NULL REFERENCES r_contents(content_id) ON DELETE CASCADE,
  author_id     BIGINT REFERENCES r_users(user_id) ON DELETE SET NULL,
  body          TEXT NOT NULL,
  posted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 子ども
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_children (
  child_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  album_id      BIGINT NOT NULL REFERENCES r_albums(album_id),
  name          TEXT NOT NULL,
  birthday      DATE,
  gender_id     BIGINT NOT NULL REFERENCES r_gender(gender_id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
