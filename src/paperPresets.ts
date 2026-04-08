export type PaperPreset = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  group: string;
};

/** ISO 216 A 判（短辺 × 長辺 mm） */
function seriesA(): PaperPreset[] {
  const sizes: [number, number][] = [
    [841, 1189],
    [594, 841],
    [420, 594],
    [297, 420],
    [210, 297],
    [148, 210],
  ];
  return sizes.map(([a, b], i) => {
    const w = Math.min(a, b);
    const h = Math.max(a, b);
    return {
      id: `a${i}`,
      label: `A${i}（${w}×${h}mm）`,
      widthMm: w,
      heightMm: h,
      group: 'A判（ISO）',
    };
  });
}

/** JIS B 判。B0 を 1030×1456 とし長辺半分で分割（短辺×長辺 mm） */
function seriesB(): PaperPreset[] {
  const sizes: [number, number][] = [
    [1030, 1456],
    [728, 1030],
    [515, 728],
    [364, 515],
    [257, 364],
    [182, 257],
  ];
  return sizes.map(([a, b], i) => {
    const w = Math.min(a, b);
    const h = Math.max(a, b);
    return {
      id: `b${i}`,
      label: `B${i}（${w}×${h}mm）`,
      widthMm: w,
      heightMm: h,
      group: 'B判（JIS）',
    };
  });
}

/**
 * 用紙プリセット。写真用 L版（89×127）は印刷用紙の「L判（800×1100）」とは別。
 */
export const PAPER_PRESETS: PaperPreset[] = [
  {
    id: 'photo-l',
    label: '写真用 L版（89×127mm）',
    widthMm: 89,
    heightMm: 127,
    group: '写真・定番',
  },
  {
    id: 'hatron',
    label: 'ハトロン判（900×1200mm）',
    widthMm: 900,
    heightMm: 1200,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'l-ban',
    label: 'L判 用紙（800×1100mm）※写真L版ではありません',
    widthMm: 800,
    heightMm: 1100,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'shiroku',
    label: '四六判（788×1091mm）',
    widthMm: 788,
    heightMm: 1091,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'ge',
    label: 'GE判（750×1100mm）',
    widthMm: 750,
    heightMm: 1100,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'k',
    label: 'K判（640×940mm）',
    widthMm: 640,
    heightMm: 940,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'kiku',
    label: '菊判（636×939mm）',
    widthMm: 636,
    heightMm: 939,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'chu',
    label: '中判（560×760mm）',
    widthMm: 560,
    heightMm: 760,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'mokutanshi',
    label: '木炭紙判（500×650mm）',
    widthMm: 500,
    heightMm: 650,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'mino',
    label: '美濃判（273×393mm）',
    widthMm: 273,
    heightMm: 393,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'hanshi',
    label: '半紙判（242×334mm）',
    widthMm: 242,
    heightMm: 334,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'a-honban',
    label: 'A本判（625×880mm）',
    widthMm: 625,
    heightMm: 880,
    group: '用紙（和洋・印刷）',
  },
  {
    id: 'b-honban',
    label: 'B本判（765×1085mm）',
    widthMm: 765,
    heightMm: 1085,
    group: '用紙（和洋・印刷）',
  },
  ...seriesA(),
  ...seriesB(),
];

export const DEFAULT_PAPER_ID = 'photo-l';

/** 用紙プリセット外の mm 指定 */
export const CUSTOM_PAPER_ID = 'custom';

export const MAX_PAPER_MM = 1200;

export function getPaperPresetById(id: string): PaperPreset | undefined {
  return PAPER_PRESETS.find((p) => p.id === id);
}

/** optgroup 順に並べた id 一覧（UI 生成用） */
export function paperGroupsOrdered(): { group: string; presets: PaperPreset[] }[] {
  const map = new Map<string, PaperPreset[]>();
  for (const p of PAPER_PRESETS) {
    const list = map.get(p.group) ?? [];
    list.push(p);
    map.set(p.group, list);
  }
  const order = [
    '写真・定番',
    '用紙（和洋・印刷）',
    'A判（ISO）',
    'B判（JIS）',
  ];
  return order
    .filter((g) => map.has(g))
    .map((group) => ({ group, presets: map.get(group)! }));
}
