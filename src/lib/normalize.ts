import { ApiRecord } from "./types";


export type Rec = Omit<ApiRecord, 'periodStart'|'periodEnd'|'createdAt'> & {
  periodStart: Date;
  periodEnd: Date;
  createdAt?: Date;
};

export function normalizeRows(rows: ApiRecord[]): Rec[] {
  return rows.map(r => ({
    ...r,
    periodStart: new Date(r.periodStart),
    periodEnd: new Date(r.periodEnd),
    createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
  }));
}
