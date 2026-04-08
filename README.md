# 証明写真シート（可変用紙・切り抜き）

ブラウザだけで、選んだ用紙サイズ（mm）に証明写真サイズのタイルを敷き詰めたシートを作れます。画像はサーバーに送られません。

## 使い方

1. `npm install` のあと `npm run dev` で開発サーバーを起動します。
2. 右上の **表示** でライト / ダーク / システムに合わせるを選べます（設定はブラウザに保存されます）。
3. **用紙プリセット**（写真用 L版、A4、印刷用紙の各判、A/B 判など）を選びます。
4. **切り抜きプリセット**（デフォルトは縦長の汎用 24×30mm。横長 30×24、免許・履歴書・パスポート相当も選べます）または **カスタム mm** を選びます。
5. 写真を選び、枠内でドラッグ・ズームして「切り抜きを確定」します。
6. 余白・間隔を調整し、**PDF** または条件を満たすときだけ **PNG（300dpi）** をダウンロードします。

用紙や切り抜きサイズを変えたあとは、切り抜きからやり直してください。

## Web へ公開する（ビルド）

```bash
npm run build
```

`dist/` を静的ホスティング（Cloudflare Pages、Netlify、GitHub Pages、S3+CloudFront、[Vercel](https://vercel.com/) など）にアップロードします。

### 本番 URL の指定（SEO 推奨）

ルートの `.env.example` を参考に、**末尾スラッシュなし**のオリジンを設定してからビルドしてください。

```bash
VITE_SITE_ORIGIN=https://あなたのドメイン.example npm run build
```

**Vercel の場合**

- **推奨（canonical を固定）**: プロジェクトの **Settings → Environment Variables** に、Production 向けに `VITE_SITE_ORIGIN` を例として `https://shashinsho-sheet.vercel.app`（独自ドメインならその URL）を登録して再デプロイする。ダッシュボードの値は `process.env` 経由でビルドに渡る（`.env` に書かなくてよい）。
- **補助**: 変数未設定でも、Vercel がビルド時に渡す `VERCEL_URL` から `https://…` を自動補完して sitemap・canonical 等を生成する。プレビューデプロイでは URL がデプロイごとに変わるため、本番ドメインで揃えたいときは必ず `VITE_SITE_ORIGIN` を設定すること。

設定すると次が **その URL 前提**で埋め込まれます。

- `<link rel="canonical">`
- `og:url` / `og:image`（絶対 URL）
- `dist/sitemap.xml`
- `dist/llms.txt`（LLM / AI クローラ向け要約の更新版）
- `robots.txt` の `Sitemap:` 行

未設定の場合は canonical・OG 絶対 URL・sitemap 自動生成は省略され、`public/llms.txt` がそのまま配信されます。

## SEO・構造化データ・LLM 向け

実装済みの内容の例です。

- **メタ**: `description`、`robots`、`theme-color`（システムのライト/ダーク別）
- **OGP / Twitter Card**: タイトル・説明・画像（`VITE_SITE_ORIGIN` 設定時）
- **JSON-LD**: `WebSite`（URL 設定時）、`WebApplication`、`FAQPage`
- **本文**: `<main>`、見出し階層、スキップリンク、ページ内 FAQ（人間向け＋スキーマと整合）
- **`/robots.txt`**: ビルドで生成（許可＋可能なら Sitemap URL）
- **`/sitemap.xml`**: `VITE_SITE_ORIGIN` ありのビルドで生成
- **`/llms.txt`**: 要約と主要トピック（公開用はビルドで上書き推奨）
- **`/og-image.svg`**: OGP 用（一部 SNS は PNG/JPG を好むため、必要なら 1200×630 の `og-image.png` を追加し、ビルド後の `index.html` またはテンプレートで差し替えてください）

**検索順位について**: 技術的な SEO は「検索エンジンに正しく理解してもらう」ための土台です。**特定キーワードで常に上位に出ることは保証できません**（競合、被リンク、コンテンツの独自性、検索アルゴリズムの変化などの影響が大きいです）。継続的に有用な説明・更新・外部からの言及があると有利になりやすい、という程度の期待に留めてください。

## 用紙プリセットについて

- **写真用 L版（89×127mm）** はコンビニ等の写真プリント用です。印刷業界の **L判（800×1100mm など）** とは別物です。
- ハトロン・四六・GE・K・菊・中・木炭紙・美濃・半紙・A本・B本の寸法は参考用の一覧として登録しています（実際の紙はメーカー・品番で多少差がある場合があります）。
- **A判**は ISO 216、**B判**は JIS（B0 を 1030×1456mm とした半裁規則）に基づく代表値です。

## PNG と PDF

- **PDF** は用紙の実寸（mm→pt）で 1 ページ出力します。大判用紙でも利用できます。
- **PNG** は 300dpi 換算で_canvas_の辺が **8192px を超える用紙**では無効になります。その場合は PDF を使ってください。

## ビルド

`npm run build` で `dist/` に静的ファイルが出力されます。
