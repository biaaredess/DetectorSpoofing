/** Criação de elementos sem framework: `h('p', { class: 'x' }, 'texto')`. */

type Attributes = Readonly<Record<string, string | number | boolean | undefined>>;
export type Child = Node | string | number | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined || value === false) continue;
    element.setAttribute(name, value === true ? '' : String(value));
  }
  element.append(...toNodes(children));
  return element;
}

function toNodes(children: readonly Child[]): (Node | string)[] {
  return children.flatMap((child) => {
    if (child === null || child === undefined || child === false) return [];
    return typeof child === 'number' ? [String(child)] : [child];
  });
}

/** Elemento a partir de SVG fixo do próprio código (nunca de texto do usuário). */
export function svgFromMarkup(markup: string): SVGElement {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  const svg = template.content.firstElementChild;
  if (!(svg instanceof SVGElement)) throw new Error('Marcação SVG inválida');
  return svg;
}

export function onClick(element: HTMLElement, handler: () => void): void {
  element.addEventListener('click', handler);
}

export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
