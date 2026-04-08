export type SlotPreset = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
};

export const SLOT_PRESETS: SlotPreset[] = [
  { id: 'generic-24-30', label: '汎用（24×30mm）', widthMm: 24, heightMm: 30 },
  { id: 'generic-30-24', label: '汎用・横長（30×24mm）', widthMm: 30, heightMm: 24 },
  { id: 'license', label: '運転免許証（24×30mm）', widthMm: 24, heightMm: 30 },
  { id: 'resume', label: '履歴書（30×40mm）', widthMm: 30, heightMm: 40 },
  {
    id: 'passport',
    label: 'パスポート／マイナンバー（35×45mm）',
    widthMm: 35,
    heightMm: 45,
  },
];

export const CUSTOM_SLOT_ID = 'custom';

export const MAX_SLOT_MM = 200;

export const DEFAULT_SLOT_PRESET_ID = 'generic-24-30';

export function getSlotPresetById(id: string): SlotPreset | undefined {
  return SLOT_PRESETS.find((s) => s.id === id);
}
