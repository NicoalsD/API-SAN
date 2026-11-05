export const MODALIDADES = ['presencial', 'virtual', 'hibrida'] as const;
export const JORNADAS = ['diurna', 'nocturna', 'mixta'] as const;

export type Modalidad = (typeof MODALIDADES)[number];
export type Jornada = (typeof JORNADAS)[number];
