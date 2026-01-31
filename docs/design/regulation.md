# Family Album デザインレギュレーション

> [!NOTE]
> このドキュメントは現在のフロントエンド実装から抽出したデザインシステムの簡易版です。

## 目次

1. [カラーパレット](#カラーパレット)
2. [タイポグラフィ](#タイポグラフィ)
3. [スペーシング](#スペーシング)
4. [コンポーネント](#コンポーネント)
5. [レイアウト](#レイアウト)
6. [アニメーション・トランジション](#アニメーショントランジション)
7. [その他のパターン](#その他のパターン)

---

## カラーパレット

### プライマリカラー（Indigo系）

アプリケーションのメインカラー

| Tailwind | HEX | RGB | 用途 |
|----------|-----|-----|------|
| `indigo-50` | `#eef2ff` | `rgb(238, 242, 255)` | バックグラウンド（極淡） |
| `indigo-100` | `#e0e7ff` | `rgb(224, 231, 255)` | バックグラウンド（淡）、プレースホルダー背景 |
| `indigo-200` | `#c7d2fe` | `rgb(199, 210, 254)` | ホバーボーダー |
| `indigo-300` | `#a5b4fc` | `rgb(165, 180, 252)` | プレースホルダーアイコン |
| `indigo-400` | `#818cf8` | `rgb(129, 140, 248)` | アバター、アイコン |
| `indigo-500` | `#6366f1` | `rgb(99, 102, 241)` | フォーカスリング |
| `indigo-600` | `#4f46e5` | `rgb(79, 70, 229)` | **メインカラー**、グラデーション始点、アクセント |
| `indigo-700` | `#4338ca` | `rgb(67, 56, 202)` | アクティブ状態、Outlineボタンテキスト |

### セカンダリカラー（Purple系）

| Tailwind | HEX | RGB | 用途 |
|----------|-----|-----|------|
| `purple-50` | `#faf5ff` | `rgb(250, 245, 255)` | バックグラウンド（淡） |
| `purple-100` | `#f3e8ff` | `rgb(243, 232, 255)` | バックグラウンド |
| `purple-500` | `#a855f7` | `rgb(168, 85, 247)` | アバター終点 |
| `purple-600` | `#9333ea` | `rgb(147, 51, 234)` | グラデーション終点 |

### アクセントカラー（Pink系）

| Tailwind | HEX | RGB | 用途 |
|----------|-----|-----|------|
| `pink-100` | `#fce7f3` | `rgb(252, 231, 243)` | バックグラウンドアクセント |

### ニュートラルカラー（Gray系）

テキスト、ボーダー、背景に使用

| Tailwind | HEX | RGB | 用途 |
|----------|-----|-----|------|
| `gray-50` | `#f9fafb` | `rgb(249, 250, 251)` | ホバー背景、リスト項目背景 |
| `gray-100` | `#f3f4f6` | `rgb(243, 244, 246)` | カードボーダー、バッジ背景 |
| `gray-200` | `#e5e7eb` | `rgb(229, 231, 235)` | 淡いボーダー、プログレスバーベース |
| `gray-300` | `#d1d5db` | `rgb(209, 213, 219)` | ボーダー、セカンダリボタンボーダー |
| `gray-400` | `#9ca3af` | `rgb(156, 163, 175)` | 無効状態、メタ情報（薄） |
| `gray-500` | `#6b7280` | `rgb(107, 114, 128)` | メタ情報、ヘルプテキスト |
| `gray-600` | `#4b5563` | `rgb(75, 85, 99)` | サブテキスト、リンク |
| `gray-700` | `#374151` | `rgb(55, 65, 81)` | 通常テキスト、セカンダリボタン、バッジ |
| `gray-800` | `#1f2937` | `rgb(31, 41, 55)` | 強調テキスト、見出し |
| `gray-900` | `#111827` | `rgb(17, 24, 39)` | 最も強い強調 |

### ステータスカラー

#### 成功（Success）

| Tailwind | HEX | RGB | 用途 |
|----------|-----|-----|------|
| `green-100` | `#dcfce7` | `rgb(220, 252, 231)` | 成功メッセージ背景 |
| `green-700` | `#15803d` | `rgb(21, 128, 61)` | 成功メッセージテキスト |

#### エラー（Error）

| Tailwind | HEX | RGB | 用途 |
|----------|-----|-----|------|
| `red-50` | `#fef2f2` | `rgb(254, 242, 242)` | エラー背景（淡） |
| `red-100` | `#fee2e2` | `rgb(254, 226, 226)` | エラー背景 |
| `red-200` | `#fecaca` | `rgb(254, 202, 202)` | エラーボーダー |
| `red-500` | `#ef4444` | `rgb(239, 68, 68)` | エラーテキスト（全画面） |
| `red-700` | `#b91c1c` | `rgb(185, 28, 28)` | エラーテキスト |

#### 役割バッジ

| Tailwind | HEX | RGB | 用途 |
|----------|-----|-----|------|
| `amber-100` | `#fef3c7` | `rgb(254, 243, 199)` | Owner（管理者）背景 |
| `amber-800` | `#92400e` | `rgb(146, 64, 14)` | Owner（管理者）テキスト |
| `blue-100` | `#dbeafe` | `rgb(219, 234, 254)` | Admin（副管理者）背景 |
| `blue-600` | `#2563eb` | `rgb(37, 99, 235)` | プログレスバー |
| `blue-800` | `#1e40af` | `rgb(30, 64, 175)` | Admin（副管理者）テキスト |

### その他

| カラー | HEX | RGB | 用途 |
|--------|-----|-----|------|
| `white` | `#ffffff` | `rgb(255, 255, 255)` | カード背景、ボタンテキスト |
| `black/60` | `rgba(0, 0, 0, 0.6)` | - | 動画バッジ背景（透過） |

### カラーグラデーション

**プライマリグラデーション**（ボタン、見出し）:
```css
background: linear-gradient(to right, #4f46e5, #9333ea);
/* indigo-600 → purple-600 */
```

**ページ背景グラデーション**:
```css
background: linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff);
/* indigo-50 → white → purple-50 */
```

**プレースホルダーグラデーション**:
```css
background: linear-gradient(to bottom right, #e0e7ff, #faf5ff, #fce7f3);
/* indigo-100 → purple-50 → pink-100 */
```

**アバターグラデーション**:
```css
background: linear-gradient(to bottom right, #818cf8, #a855f7);
/* indigo-400 → purple-500 */
```

---

## タイポグラフィ

### 見出し

**H1（ページタイトル）**: 
- サイズ: `text-4xl` (36px / 2.25rem)
- フォントウェイト: `font-bold` (700)
- カラー: グラデーション `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`

**H2（セクション）**:
- サイズ: `text-2xl` (24px / 1.5rem)
- フォントウェイト: `font-semibold` (600)
- カラー: `text-gray-700` (#374151)

**H3（カード内見出し）**:
- サイズ: `text-lg` (18px / 1.125rem)
- フォントウェイト: `font-semibold` (600)
- カラー: `text-gray-800` (#1f2937)、ホバー時 `text-indigo-600` (#4f46e5)

### 本文

- **通常テキスト**: デフォルトサイズ (16px / 1rem)、`text-gray-700` (#374151)
- **サブテキスト**: `text-gray-600` (#4b5563)
- **メタ情報**: `text-sm` (14px / 0.875rem) `text-gray-500` (#6b7280)
- **極小テキスト**: `text-xs` (12px / 0.75rem)

### フォントウェイト

- `font-bold` (700): 見出し
- `font-semibold` (600): ボタン、サブ見出し
- `font-medium` (500): 強調テキスト
- デフォルト (400): 本文

---

## スペーシング

### パディング

- **ページコンテナ**: `px-4 py-12` (16px / 48px)
- **カード**: `p-5` (20px)、`p-6` (24px)
- **セクションカード**: `p-6` (24px)
- **情報カード**: `p-4` (16px)
- **ボタン**:
  - Small: `px-4 py-2` (16px / 8px)
  - Medium: `px-6 py-3` (24px / 12px)
  - Large: `px-6 py-4` (24px / 16px)

### マージン

- **セクション間**: `mb-12` (48px)
- **要素間（大）**: `mb-8` (32px)
- **要素間（中）**: `mb-6` (24px)
- **要素間（小）**: `mb-4` (16px)
- **アイコンとテキスト**: `mr-2` (8px)、`mr-1` (4px)

### ギャップ（Grid/Flex）

- **カードグリッド**: `gap-6` (24px)
- **フォーム**: `space-y-6` (24px)
- **リスト**: `space-y-3` (12px)

---

## コンポーネント

### ボタン

#### バリアント

**Primary（デフォルト）**:
```css
background: linear-gradient(to right, #4f46e5, #9333ea); /* indigo-600 → purple-600 */
color: #ffffff;
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); /* shadow-lg */
```
- ホバー: `box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1)` (shadow-xl)
- ホバー: `transform: translateY(-2px)` (hover:-translate-y-0.5)

**Secondary**:
```css
background: #ffffff;
border: 1px solid #d1d5db; /* gray-300 */
color: #374151; /* gray-700 */
box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow */
```
- ホバー: `background: #f9fafb` (gray-50)

**Outline**:
```css
background: #eef2ff; /* indigo-50 */
color: #4338ca; /* indigo-700 */
```
- ホバー: `background: #e0e7ff` (indigo-100)

#### サイズ

- Small: `px-4 py-2 text-sm` (16px 8px, 14px)
- Medium: `px-6 py-3` (24px 12px)
- Large: `px-6 py-4` (24px 16px)

#### 共通スタイル

- 角丸: `border-radius: 0.75rem` (12px, rounded-xl)
- フォントウェイト: `font-weight: 600` (font-semibold)
- トランジション: `transition: all 0.2s` (transition-all duration-200)

#### 無効状態

- `opacity: 0.5` + `cursor: not-allowed`

### カード

**AlbumCard / ContentItem**:
```css
background: #ffffff;
border-radius: 1rem; /* 16px, rounded-2xl */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); /* shadow-md */
border: 1px solid #f3f4f6; /* gray-100 */
transition: all 0.3s;
```
- ホバー: `box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1)` (shadow-xl)
- ホバー: `border-color: #c7d2fe` (indigo-200)

**セクションカード**:
```css
background: #ffffff;
border-radius: 0.75rem; /* 12px, rounded-xl */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); /* shadow-md */
padding: 24px; /* p-6 */
```

### フォーム要素

**Input / Select**:
```css
width: 100%;
padding: 12px 16px; /* py-3 px-4 */
border: 1px solid #d1d5db; /* gray-300 */
border-radius: 0.75rem; /* 12px, rounded-xl */
transition: colors 0.15s;
```
- フォーカス: `border-color: #6366f1` (indigo-500)
- フォーカス: `box-shadow: 0 0 0 2px rgb(99 102 241 / 0.5)` (ring-2 ring-indigo-500)

**Label**:
```css
display: block;
font-size: 14px; /* text-sm */
font-weight: 500; /* font-medium */
color: #374151; /* gray-700 */
margin-bottom: 8px; /* mb-2 */
```

### リンク

**BackLink**:
```css
display: inline-flex;
align-items: center;
color: #4b5563; /* gray-600 */
transition: color 0.15s;
```
- ホバー: `color: #4f46e5` (indigo-600)

### バッジ

**役割バッジ**:

Owner（管理者）:
```css
background: #fef3c7; /* amber-100 */
color: #92400e; /* amber-800 */
padding: 8px 16px; /* py-2 px-4 */
border-radius: 9999px; /* rounded-full */
font-size: 14px; /* text-sm */
font-weight: 600; /* font-semibold */
```

Admin（副管理者）:
```css
background: #dbeafe; /* blue-100 */
color: #1e40af; /* blue-800 */
```

Member（メンバー）:
```css
background: #f3f4f6; /* gray-100 */
color: #374151; /* gray-700 */
```

**動画インジケーター**:
```css
position: absolute;
bottom: 8px;
right: 8px;
background: rgba(0, 0, 0, 0.6);
color: #ffffff;
padding: 4px 8px; /* py-1 px-2 */
border-radius: 6px; /* rounded-md */
font-size: 12px; /* text-xs */
font-weight: 500; /* font-medium */
```

### アバター

**ユーザーアバター（イニシャル表示）**:
```css
width: 48px; /* w-12 */
height: 48px; /* h-12 */
background: linear-gradient(to bottom right, #818cf8, #a855f7); /* indigo-400 → purple-500 */
border-radius: 9999px; /* rounded-full */
display: flex;
align-items: center;
justify-content: center;
color: #ffffff;
font-weight: 600; /* font-semibold */
font-size: 18px; /* text-lg */
```

### メッセージ・通知

**エラーメッセージ（インライン）**:
```css
padding: 16px; /* p-4 */
background: #fef2f2; /* red-50 */
border: 1px solid #fecaca; /* red-200 */
color: #b91c1c; /* red-700 */
border-radius: 0.75rem; /* rounded-xl */
```

**成功メッセージ**:
```css
padding: 12px; /* p-3 */
background: #dcfce7; /* green-100 */
color: #15803d; /* green-700 */
border-radius: 0.375rem; /* rounded */
```

### プログレスバー

**バー背景**:
```css
width: 100%;
background: #e5e7eb; /* gray-200 */
border-radius: 9999px; /* rounded-full */
height: 10px; /* h-2.5 */
```

**プログレスインジケーター**:
```css
background: #2563eb; /* blue-600 */
height: 10px; /* h-2.5 */
border-radius: 9999px; /* rounded-full */
transition: all 0.3s;
width: [動的]; /* 例: 75% */
```

### ローディングスピナー

```css
border-bottom: 2px solid #4f46e5; /* indigo-600 */
border-radius: 9999px;
animation: spin 1s linear infinite;
```
- Small: `48px × 48px` (w-6 h-6)
- Medium: `48px × 48px` (w-12 h-12)
- Large: `64px × 64px` (w-16 h-16)

### EmptyState

**アイコン背景**:
```css
width: 96px; /* w-24 */
height: 96px; /* h-24 */
background: linear-gradient(to bottom right, #e0e7ff, #f3e8ff); /* indigo-100 → purple-100 */
border-radius: 9999px; /* rounded-full */
display: flex;
align-items: center;
justify-content: center;
```

---

## レイアウト

### ページレイアウト

```css
min-height: 100vh;
background: linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff);
/* indigo-50 → white → purple-50 */
```

**最大幅オプション**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
- `4xl`: 896px
- `6xl`: 1152px（デフォルト）

### グリッド

レスポンシブグリッド:
```css
display: grid;
grid-template-columns: 1fr; /* デフォルト */

@media (min-width: 640px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 1024px) {
  grid-template-columns: repeat(3, 1fr);
}

gap: 24px; /* gap-6 */
```

---

## アニメーション・トランジション

### デュレーション

- **標準**: `200ms`, `300ms`
- **すべて**: `transition: all`

### ホバーエフェクト

**カード**:
```css
transition: all 0.3s;
```
- シャドウ: `shadow-md` → `shadow-xl`
- ボーダー: `border-gray-100` → `border-indigo-200`
- 内部要素スケール: `transform: scale(1.05)` (group-hover:scale-105)

**ボタン**:
```css
transition: all 0.2s;
```
- シャドウ: `shadow-lg` → `shadow-xl`
- 移動: `transform: translateY(-2px)` (hover:-translate-y-0.5)

**リンク**:
```css
transition: color 0.15s;
```
- カラー: `#4b5563` → `#4f46e5` (gray-600 → indigo-600)

### アニメーション

**スピナー**:
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
animation: spin 1s linear infinite;
```

---

## その他のパターン

### シャドウ

- カード: `0 4px 6px -1px rgb(0 0 0 / 0.1)` (shadow-md)
- カードホバー: `0 20px 25px -5px rgb(0 0 0 / 0.1)` (shadow-xl)
- プライマリボタン: `0 10px 15px -3px rgb(0 0 0 / 0.1)` (shadow-lg)
- セカンダリボタン: `0 1px 2px 0 rgb(0 0 0 / 0.05)` (shadow)

### 角丸

- カード: `1rem` (16px, rounded-2xl)
- ボタン/フォーム: `0.75rem` (12px, rounded-xl)
- 情報カード: `0.5rem` (8px, rounded-lg)
- バッジ: `6px` (rounded-md)
- フル: `9999px` (rounded-full)

### ボーダー

- カード: `1px solid #f3f4f6` (gray-100)
- フォーム: `1px solid #d1d5db` (gray-300)
- エラー: `1px solid #fecaca` (red-200)

### レスポンシブブレークポイント

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## まとめ

このデザインレギュレーションは、Family Albumアプリケーションの一貫性のあるUI/UXを維持するための基準です。

### デザインの特徴

1. **カラースキーム**: Indigo (#4f46e5) / Purple (#9333ea) 系のグラデーションを中心とした、温かみのあるカラーパレット
2. **モダンなUI**: 角丸（12-16px）とシャドウを活用した柔らかい印象
3. **インタラクティブ性**: ホバーエフェクト、トランジション（200-300ms）、アニメーションによる豊かなフィードバック
4. **レスポンシブ**: モバイルから大画面まで対応したグリッドシステム

### 他システムへの適用

このドキュメントのカラーコード（HEX/RGB値）を使用することで、Tailwind CSS以外のフレームワークやデザインツールでも同じデザインを再現できます。

**適用例**:
- **Figma/Adobe XD**: HEXコードを直接使用
- **CSS/SCSS**: RGB値やHEX値で変数定義
- **Material-UI/Chakra UI**: カラーパレットとして設定
- **React Native**: StyleSheetにHEXコードを使用

### 使用方法

新しいコンポーネントを作成する際は：

1. このドキュメントの該当セクションを参照
2. 既存のコンポーネント（`Button`, `AlbumCard`, `PageLayout`など）を再利用
3. カラー、スペーシング、トランジションの値を統一
4. 新しいパターンを追加した場合は、このドキュメントに追記

### 関連ファイル

- CSS設定: [`frontend/app/index.css`](../frontend/app/index.css)
- Tailwind設定: [`frontend/tailwind.config.js`](../frontend/tailwind.config.js)
- 共通コンポーネント: [`frontend/app/components/`](../frontend/app/components/)
