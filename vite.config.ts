import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * VITE_SITE_ORIGIN が空のときは url を付けず、絶対 URL が不正にならないようにする。
 * featureList の mm はアプリの slot プリセットと一致（履歴書 30×40、免許 24×30 など）。
 */
function buildJsonLd(origin: string): string {
  const webPage =
    origin !== ''
      ? {
          '@type': 'WebPage',
          '@id': `${origin}/#webpage`,
          url: `${origin}/`,
          name: '証明写真シート｜ブラウザで無料生成・コンビニ印刷対応',
          description:
            '証明写真シートをブラウザだけで無料生成。写真用L版・A4に敷き詰めPDF・300dpi PNG保存&コンビニ印刷対応。パスポート35×45mm・履歴書24×30mm・マイナンバーカード対応。サーバーへの送信なし。',
          inLanguage: 'ja-JP',
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${origin}/#website`,
            name: '証明写真シート',
            url: `${origin}/`,
          },
        }
      : null;

  const webApp: Record<string, unknown> = {
    '@type': 'WebApplication',
    name: '証明写真シート',
    alternateName: '証明写真シート無料生成ツール',
    description: 'ブラウザだけで証明写真シートを無料生成。写真用L版・A4に敷き詰めPDF・300dpi PNG保存&コンビニ印刷対応。パスポート35×45mm・履歴書24×30mm・マイナンバーカード対応。サーバーへの送信なし。',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    author: {
      '@type': 'Organization',
      name: '証明写真シート',
    },
    featureList: [
      'ブラウザ内完結・サーバー送信なし・アプリ不要・登録不要',
      'mm単位の切り抜きサイズ指定',
      '写真用L版（89×127mm）・A4・B4・ハトロン判など多数の用紙プリセット＋カスタムmm指定',
      '汎用（24×30mm）・横長（30×24mm）・履歴書（30×40mm）・免許証（24×30mm）・パスポート／マイナンバー（35×45mm）サイズプリセット',
      'PDF・300dpi PNGダウンロード',
      'コンビニ（セブン・ローソン・ファミマ）のマルチコピー機で印刷可能',
      '余白・写真間隔のmm指定',
    ],
    inLanguage: 'ja',
  };
  if (origin) {
    webApp.url = `${origin}/`;
  }

  const graph: unknown[] = [];
  if (webPage) graph.push(webPage);
  graph.push(webApp);
  graph.push({
    '@type': 'HowTo',
    name: '証明写真シートをブラウザで無料生成する方法',
    description: '写真用L版・A4などの用紙に証明写真を敷き詰めたシートをブラウザだけで作る手順です。',
    totalTime: 'PT2M',
    tool: [{ '@type': 'HowToTool', name: 'Webブラウザ（Chrome・Safari・Firefox等）' }],
    supply: [{ '@type': 'HowToSupply', name: '証明写真に使う画像ファイル（JPEG・PNG等）' }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: '用紙サイズを選ぶ',
        text: '「写真用L版（89×127mm）」「A4」などの用紙プリセットを選択します。特殊サイズはカスタムmm入力で指定できます。',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: '証明写真サイズを選ぶ',
        text: 'パスポート（35×45mm）・履歴書（24×30mm）・マイナンバーカードなどのプリセットを選択します。提出先の規格に合わせてカスタムmmで指定も可能です。',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: '写真をアップロードする',
        text: 'スマホやパソコンから証明写真に使う画像ファイル（JPEG・PNG等）を選択します。',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: '切り抜き位置を調整する',
        text: '枠内でドラッグして顔の位置を合わせ、ズームスライダーで拡大縮小したあと「切り抜きを確定」ボタンを押します。',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'PDFまたはPNGをダウンロードする',
        text: '余白・写真間隔を調整し、「PDFをダウンロード」または「PNGをダウンロード（300dpi）」を押して保存します。コンビニのマルチコピー機や自宅プリンターで印刷できます。',
      },
    ],
  });

  graph.push({
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '証明写真シートを無料で作れますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'はい、完全無料で作れます。アカウント登録・アプリのインストールも不要です。ブラウザでこのページを開くだけで利用できます。',
            },
          },
          {
            '@type': 'Question',
            name: 'L版1枚に証明写真は何枚入りますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '写真用L版（89×127mm）にパスポートサイズ（35×45mm）を余白3mm・間隔2mmで配置した場合、2列×2行の4枚が入ります。履歴書サイズ（24×30mm）では3列×3行の9枚前後が入ります。枚数はレイアウトプレビューで確認できます。',
            },
          },
          {
            '@type': 'Question',
            name: 'スマホやパソコンから証明写真シートは作れますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'iOS Safari・Android Chrome・PC の主要ブラウザで利用できます。大判用紙での PNG はメモリ制約で失敗することがあるため、その場合は PDF をご利用ください。',
            },
          },
          {
            '@type': 'Question',
            name: '背景は自動で無地や青に変わりますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'いいえ。背景の自動削除・色替えは行わず、固定比率の切り抜きと用紙への配置に特化しています。無地背景が必要な場合は別途加工した画像を読み込んでください。',
            },
          },
          {
            '@type': 'Question',
            name: '切り抜きの位置やズームを後から変えられますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '「3. 写真を選ぶ」で同じ画像を再選択すると切り抜き画面に戻り、位置・ズームをやり直せます。',
            },
          },
          {
            '@type': 'Question',
            name: '幅と高さを自分で指定するにはどうすればいいですか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '「2. 切り抜きサイズ」のプリセットで「カスタム」を選ぶと、横・縦を mm 単位で自由に入力できます。',
            },
          },
          {
            '@type': 'Question',
            name: '余白や写真の間隔はどこで変えますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '「5. レイアウトと保存」セクションの「余白（mm）」「写真の間隔（mm）」入力欄で変更できます。変更は即座にプレビューに反映されます。',
            },
          },
          {
            '@type': 'Question',
            name: 'コンビニで印刷できますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'PDF または PNG を USB メモリやスマホに保存してマルチコピー機で印刷できます。写真用 L 版に配置した PDF を「写真プリント（L 判）」で印刷するのが一般的です。',
            },
          },
          {
            '@type': 'Question',
            name: 'データ入稿（ネットプリント・印刷会社）にも使えますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '使えます。PNG（300dpi・sRGB）はそのまま入稿データとして利用できます。入稿先の仕様をご確認ください。',
            },
          },
          {
            '@type': 'Question',
            name: '印刷したら余白が大きくなってしまいました。',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '印刷ダイアログで「実際のサイズ（100%）」または「用紙に合わせて拡大縮小しない」を選択してください。',
            },
          },
          {
            '@type': 'Question',
            name: 'パスポート・マイナンバーカードの規定サイズは何 mm ですか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'パスポート・マイナンバーカードともに縦 45mm × 横 35mm です。プリセット「パスポート／マイナンバー（35×45mm）」で自動設定されます。',
            },
          },
          {
            '@type': 'Question',
            name: '履歴書・就活用の証明写真のサイズは？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '一般的な履歴書用は縦 30mm × 横 24mm です。提出先によって縦 40mm × 横 30mm を指定する場合もあります。',
            },
          },
          {
            '@type': 'Question',
            name: '「写真用 L 版」と「L 判」の違いは何ですか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '写真用 L 版（89×127mm）はプリント用の小型用紙です。L 判（800×1100mm）は印刷業界の大判用紙規格でまったく別のものです。',
            },
          },
          {
            '@type': 'Question',
            name: '用紙サイズをミリ単位で自由に指定できますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '「1. 用紙サイズ」プリセットで「カスタム」を選ぶと、用紙の幅・高さを mm 単位で自由に入力できます。',
            },
          },
          {
            '@type': 'Question',
            name: '写真はサーバーに送られますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '送られません。切り抜き・レイアウト・PDF/PNG の生成はすべてブラウザ内で行われ、画像データが外部に送信されることは一切ありません。',
            },
          },
          {
            '@type': 'Question',
            name: 'オフラインでも使えますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ページを開いた状態であれば切り抜き・PDF/PNG 生成はオフラインでも動作します。再読み込みにはインターネット接続が必要です。',
            },
          },
          {
            '@type': 'Question',
            name: 'ファイルを選んでも画像が表示されません。',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'iPhone のデフォルト形式 HEIC は一部ブラウザで非対応です。設定でフォーマットを「互換性優先」に変えるか、JPEG/PNG に変換してください。',
            },
          },
          {
            '@type': 'Question',
            name: 'PDF をダウンロードしたが、印刷すると写真がぼやけます。',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '印刷設定で「実際のサイズ（100%）」を選択してください。「ページに合わせる」がオンだとサイズが変わり解像度が下がります。',
            },
          },
        ],
      });

  const data = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

/** 末尾スラッシュを除く。Vercel ではダッシュボードの VITE_SITE_ORIGIN は process.env に載る（loadEnv は .env ファイルのみ）。 */
function resolveSiteOrigin(viteOriginFromFile: string | undefined): string {
  const fromVite =
    (viteOriginFromFile || process.env.VITE_SITE_ORIGIN || '').replace(/\/$/, '');
  if (fromVite) return fromVite;
  const vercel = (process.env.VERCEL_URL || '').replace(/\/$/, '').trim();
  if (vercel) return `https://${vercel}`;
  return '';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteOrigin = resolveSiteOrigin(env.VITE_SITE_ORIGIN);

  return {
    esbuild: {
      drop: mode === 'production' ? (['console', 'debugger'] as const) : [],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/pdf-lib')) {
              return 'pdf-lib';
            }
          },
        },
      },
    },
    plugins: [
      {
        name: 'html-placeholder-seo',
        transformIndexHtml(html: string) {
          let out = html.replaceAll('%SITE_ORIGIN%', siteOrigin);
          out = out.replace(
            '<!--SEO_CANONICAL-->',
            siteOrigin
              ? `<link rel="canonical" href="${siteOrigin}/" />`
              : '',
          );
          out = out.replace(
            '<!--SEO_OG_URL-->',
            siteOrigin
              ? `<meta property="og:url" content="${siteOrigin}/" />`
              : '',
          );
          const ogImage = siteOrigin
            ? `
    <meta property="og:image" content="${siteOrigin}/og-image.svg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="証明写真シートのイメージ" />
    <meta name="twitter:image" content="${siteOrigin}/og-image.svg" />`
            : '';
          out = out.replace('<!--SEO_OG_IMAGE-->', ogImage);
          out = out.replace('<!--JSON_LD-->', buildJsonLd(siteOrigin));
          return out;
        },
        closeBundle() {
          const outDir = path.resolve(__dirname, 'dist');
          let robots = `User-agent: *
Allow: /

`;
          if (siteOrigin) {
            robots += `Sitemap: ${siteOrigin}/sitemap.xml
`;
          }
          fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf8');

          if (!siteOrigin) return;

          const lastmod = new Date().toISOString().slice(0, 10);
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteOrigin}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
          fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8');
          const llms = `# 証明写真シート（ブラウザ完結型）

## Summary
無料のWebツール。証明写真を指定mmで切り抜き、写真用L版・A4・B判・印刷用紙プリセットにタイル配置し、PDF・300dpi PNGで保存する。画像はサーバーに送信されない（クライアントのみで処理）。

## Site
${siteOrigin}/

## Topics
- 証明写真 レイアウト PDF 無料
- 写真用 L版 89×127 枚数 シート
- 履歴書 写真 30×40mm
- 運転免許 写真 24×30mm
- パスポート 写真 35×45mm
- A4 B4 証明写真 並べる
`;
          fs.writeFileSync(path.join(outDir, 'llms.txt'), llms, 'utf8');
        },
      },
    ],
  };
});
