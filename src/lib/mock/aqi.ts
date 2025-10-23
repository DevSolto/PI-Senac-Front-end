export type AqiCategory =
  | 'good'
  | 'moderate'
  | 'unhealthy-for-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

interface AqiRange {
  limit: number;
  category: AqiCategory;
  color: string;
}

const AQI_RANGES: AqiRange[] = [
  { limit: 50, category: 'good', color: '#2ecc71' },
  { limit: 100, category: 'moderate', color: '#f1c40f' },
  { limit: 150, category: 'unhealthy-for-sensitive', color: '#e67e22' },
  { limit: 200, category: 'unhealthy', color: '#e74c3c' },
  { limit: 300, category: 'very-unhealthy', color: '#8e44ad' },
  { limit: Infinity, category: 'hazardous', color: '#7f1d1d' },
];

export function getAqiCategory(value: number): AqiCategory {
  if (!Number.isFinite(value) || value < 0) {
    return 'good';
  }

  const range = AQI_RANGES.find(({ limit }) => value <= limit);
  return range ? range.category : 'hazardous';
}

export function getAqiColor(value: number | AqiCategory): string {
  const category = typeof value === 'string' ? value : getAqiCategory(value);
  const range = AQI_RANGES.find((item) => item.category === category);
  return range?.color ?? '#95a5a6';
}
