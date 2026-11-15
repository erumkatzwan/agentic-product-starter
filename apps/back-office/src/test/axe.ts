import axe from 'axe-core';

/** WCAG 2.2 AA rules (ADR-0011). */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

/**
 * Runs axe on the rendered page and returns readable violations ([] when accessible).
 * Colour contrast needs a real browser, so it is checked by the end-to-end tests and design/build.mjs instead.
 */
export async function accessibilityViolations(node: Element = document.body): Promise<string[]> {
  const result = await axe.run(node, {
    runOnly: { type: 'tag', values: WCAG_TAGS },
    rules: { 'color-contrast': { enabled: false } },
  });
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
}
