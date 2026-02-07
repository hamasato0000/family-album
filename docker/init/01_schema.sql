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
CREATE TYPE activity_type AS ENUM ('upload', 'comment');
-- pending: 署名付きURL発行済、アップロード待ち
-- processing: 処理中
-- completed: 処理完了
-- failed: 処理失敗
-- expired: 有効期限切れ
CREATE TYPE upload_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'expired'
);
-- ------------------------------------------------------------
-- 性別
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_gender (
  gender_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  gender_name VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- ユーザー
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_user (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idp_user_id TEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- アルバム
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_album (
  album_id CHAR(12) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- 子どもとの関係
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_child_relation (
  child_relation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  relation_name VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- ユーザーアルバム（多対多）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_user_album (
  user_album_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES r_user(user_id) ON DELETE CASCADE,
  album_id CHAR(12) NOT NULL REFERENCES r_album(album_id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  child_relation VARCHAR(20) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_album_user_album ON r_user_album(user_id, album_id);
-- ------------------------------------------------------------
-- アクティビティ（近況）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS e_activity (
  activity_id CHAR(12) PRIMARY KEY,
  album_id CHAR(12) NOT NULL REFERENCES r_album(album_id),
  activity_type activity_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- アップロード
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS e_upload (
  upload_id CHAR(12) PRIMARY KEY REFERENCES e_activity(activity_id) ON DELETE CASCADE,
  uploader_id BIGINT NOT NULL REFERENCES r_user(user_id),
  photo_count BIGINT NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
  video_count BIGINT NOT NULL DEFAULT 0 CHECK (video_count >= 0),
  status upload_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- コンテンツ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_content (
  content_id CHAR(12) PRIMARY KEY,
  album_id CHAR(12) NOT NULL REFERENCES r_album(album_id),
  upload_id CHAR(12) NOT NULL REFERENCES e_upload(upload_id),
  content_type content_type NOT NULL,
  content_hash CHAR(64) UNIQUE NOT NULL,
  raw_path TEXT UNIQUE NOT NULL,
  thumbnail_path TEXT UNIQUE,
  file_size BIGINT,
  caption TEXT,
  error_message TEXT,
  taken_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- 写真（コンテンツ と 1:1）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_photo (
  photo_id CHAR(12) PRIMARY KEY REFERENCES r_content(content_id) ON DELETE CASCADE,
  width BIGINT NOT NULL,
  height BIGINT NOT NULL,
  exif JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- 動画（コンテンツ と 1:1）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_video (
  video_id CHAR(12) PRIMARY KEY REFERENCES r_content(content_id) ON DELETE CASCADE,
  duration_seconds BIGINT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- コメント
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS e_comment (
  comment_id CHAR(12) PRIMARY KEY REFERENCES e_activity(activity_id) ON DELETE CASCADE,
  content_id CHAR(12) NOT NULL REFERENCES r_content(content_id) ON DELETE CASCADE,
  author_id BIGINT REFERENCES r_user(user_id) ON DELETE
  SET NULL,
    body TEXT NOT NULL,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ------------------------------------------------------------
-- 子ども
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS r_child (
  child_id CHAR(12) PRIMARY KEY,
  album_id CHAR(12) NOT NULL REFERENCES r_album(album_id),
  name TEXT NOT NULL,
  birthday DATE,
  gender_id BIGINT NOT NULL REFERENCES r_gender(gender_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);