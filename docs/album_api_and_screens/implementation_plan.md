# アルバムAPI・画面実装計画

ユーザーがアルバムを作成し、アルバムに対して写真をアップロードできるようにするため、アルバムAPI（バックエンド）と3つの画面（フロントエンド）を実装します。

---

## ユーザー確認事項

> [!IMPORTANT]
> **認証について**: 現時点ではMVP開発のため、認証機能は未実装です。そのためユーザーIDはハードコード（仮の値）を使用します。

> [!NOTE]
> **アルバム作成時のフィールド**: 現在のスキーマでは`r_albums`テーブルにはIDとタイムスタンプのみで、アルバム名などの属性がありません。今回は現在のスキーマに合わせて実装しますが、後日アルバム名などを追加する際はスキーマ変更が必要です。

---

## 提案する変更

### API（バックエンド）

#### [MODIFY] [server.ts](file:///Users/masato/projects/family-album/api/src/server.ts)

以下のエンドポイントを追加：

| メソッド | パス | 説明 |
|---------|------|------|
| `POST` | `/albums` | 新規アルバム作成 |
| `GET` | `/albums` | アルバム一覧取得 |
| `GET` | `/albums/:albumId` | アルバム詳細取得 |
| `GET` | `/albums/:albumId/contents` | アルバム内コンテンツ一覧取得 |

---

### フロントエンド

#### [MODIFY] [api.ts](file:///Users/masato/projects/family-album/frontend/app/services/api.ts)

アルバムAPI呼び出し関数を追加：
- `createAlbum()` - アルバム作成
- `getAlbums()` - アルバム一覧取得
- `getAlbum(albumId)` - アルバム詳細取得
- `getAlbumContents(albumId)` - コンテンツ一覧取得

---

#### [NEW] [albums._index.tsx](file:///Users/masato/projects/family-album/frontend/app/routes/albums._index.tsx)

**アルバム一覧・選択画面**
- アルバム一覧をカード形式で表示
- 各アルバムをクリックでコンテンツ一覧画面へ遷移
- 「新規アルバム作成」ボタンでアルバム作成画面へ遷移

---

#### [NEW] [albums.new.tsx](file:///Users/masato/projects/family-album/frontend/app/routes/albums.new.tsx)

**アルバム作成画面**
- アルバム作成フォーム（MVP版ではボタンのみ）
- 作成成功後、アルバム一覧画面へリダイレクト

---

#### [NEW] [albums.$albumId.tsx](file:///Users/masato/projects/family-album/frontend/app/routes/albums.$albumId.tsx)

**アルバム詳細（コンテンツ一覧）画面**
- 選択されたアルバムのコンテンツ一覧をグリッド表示
- 写真/動画のサムネイル表示
- アップロードボタンで写真追加

---

## 検証計画

### 手動検証

1. **サーバー起動**
   ```bash
   cd /Users/masato/projects/family-album
   docker compose up -d
   ```

2. **API動作確認**（curlコマンド）
   ```bash
   # アルバム作成
   curl -X POST http://localhost:3000/albums

   # アルバム一覧取得
   curl http://localhost:3000/albums

   # アルバム詳細取得（{albumId}は実際のIDに置き換え）
   curl http://localhost:3000/albums/{albumId}

   # コンテンツ一覧取得
   curl http://localhost:3000/albums/{albumId}/contents
   ```

3. **フロントエンド画面確認**
   - ブラウザで `http://localhost:5173/albums` にアクセス
   - 新規アルバム作成ボタンをクリック → アルバムが作成されること
   - 作成したアルバムカードをクリック → コンテンツ一覧画面へ遷移すること
