export const fmtTemp = (v?: number | null) =>
  v == null || Number.isNaN(v) ? '-' : `${v.toFixed(1)}°C`;

export const fmtPerc = (v?: number | null) =>
  v == null || Number.isNaN(v) ? '-' : `${v.toFixed(0)}%`;

export const fmtAQI = (v?: number | null) =>
  v == null || Number.isNaN(v) ? '-' : `${v}`;

export const fmtData = (iso?: string | Date | null) => {
  if (!iso) {
    return '-';
  }

  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '-';
  }

  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const fmtMinuteSecond = (iso?: string | Date | null) => {
  if (!iso) {
    return '-';
  }

  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '-';
  }

  return d.toLocaleTimeString('pt-BR', { minute: '2-digit', second: '2-digit' });
};
