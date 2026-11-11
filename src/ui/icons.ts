import type { WeatherKind } from '../config';

/** Ícones de clima da apresentação de cada nível, no mesmo traço dos cards. */

const STROKE = 'stroke="#5A5A5A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
const CLOUD = `<path d="M30 70 a16 16 0 0 1 4-31 a22 22 0 0 1 42-4 a17 17 0 0 1 14 35 z" fill="#F6F7F8" ${STROKE}/>`;

const ICONS: Readonly<Record<WeatherKind, string>> = {
  clear: `<circle cx="60" cy="60" r="22" fill="#FF8A3D" ${STROKE}/>
    <g ${STROKE}>
      <path d="M60 14v12M60 94v12M14 60h12M94 60h12M27 27l9 9M84 84l9 9M27 93l9-9M84 36l9-9"/>
    </g>`,
  fog: `${CLOUD}<g ${STROKE}><path d="M22 86h60M38 100h64"/></g>`,
  rain: `${CLOUD}<g stroke="#4FC3D1" stroke-width="6" stroke-linecap="round">
      <path d="M42 84l-6 14M62 84l-6 14M82 84l-6 14"/></g>`,
  night: `<path d="M74 18a40 40 0 1 0 28 62a32 32 0 0 1-28-62z" fill="#4FC3D1" ${STROKE}/>
    <path d="M30 26l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFFFFF" ${STROKE} stroke-width="3"/>`,
};

export function weatherIcon(weather: WeatherKind): string {
  return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${ICONS[weather]}</svg>`;
}
