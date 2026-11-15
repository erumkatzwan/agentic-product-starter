#!/usr/bin/env node
// Generates platform files from design/tokens.json. Run: node design/build.mjs
// CI runs it with --check and fails if any generated file is out of date.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const tokens = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));
const check = process.argv.includes('--check');

const lookup = (path) => path.split('.').reduce((node, key) => node?.[key], tokens);
const resolve = (value) => {
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const target = lookup(value.slice(1, -1));
    if (!target) throw new Error(`Unknown token reference ${value}`);
    return resolve(target.$value);
  }
  return value;
};
const leaves = (node, prefix = []) =>
  Object.entries(node).flatMap(([key, child]) => {
    if (key.startsWith('$')) return [];
    if (child && typeof child === 'object' && '$value' in child) return [[[...prefix, key], resolve(child.$value)]];
    return leaves(child, [...prefix, key]);
  });
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const header = 'Generated from design/tokens.json by design/build.mjs. Do not edit by hand.';

// CSS custom properties, light by default, dark via prefers-color-scheme or data-theme="dark".
const cssVars = (pairs, indent = '  ') => pairs.map(([path, v]) => `${indent}--${path.map(kebab).join('-')}: ${v};`).join('\n');
const semantic = (mode) => leaves(tokens[mode].color).map(([p, v]) => [['color', ...p], v]);
const scale = ['font', 'space', 'radius'].flatMap((group) => leaves(tokens.core[group]).map(([p, v]) => [[group, ...p], v]));
const css = `/* ${header} */
:root {
${cssVars(scale)}
${cssVars(semantic('light'))}
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${cssVars(semantic('dark'), '    ')}
  }
}

:root[data-theme='dark'] {
${cssVars(semantic('dark'))}
}
`;

// Swift: light/dark colour pairs and the scale values for the iOS Theme.
const hex = (v) => `0x${v.replace('#', '')}`;
const light = Object.fromEntries(leaves(tokens.light.color).map(([p, v]) => [p.join('.'), v]));
const dark = Object.fromEntries(leaves(tokens.dark.color).map(([p, v]) => [p.join('.'), v]));
const px = (group, key) => parseFloat(resolve(tokens.core[group][key].$value));
const swift = `// ${header}
import UIKit

enum DesignTokens {
${Object.keys(light).map((k) => `    static let ${k} = UIColor(light: ${hex(light[k])}, dark: ${hex(dark[k])})`).join('\n')}

    enum Space {
${Object.keys(tokens.core.space).map((k) => `        static let ${k}: CGFloat = ${px('space', k)}`).join('\n')}
    }

    enum Radius {
${Object.keys(tokens.core.radius).filter((k) => k !== 'pill').map((k) => `        static let ${k}: CGFloat = ${px('radius', k)}`).join('\n')}
    }
}

extension UIColor {
    convenience init(light: UInt32, dark: UInt32) {
        self.init { traits in
            let value = traits.userInterfaceStyle == .dark ? dark : light
            return UIColor(
                red: CGFloat((value >> 16) & 0xFF) / 255,
                green: CGFloat((value >> 8) & 0xFF) / 255,
                blue: CGFloat(value & 0xFF) / 255,
                alpha: 1
            )
        }
    }
}
`;

// Kotlin: light and dark colour sets and the scale values for the Android Compose theme.
const argb = (v) => `0xFF${v.replace('#', '').toUpperCase()}`;
const kotlinColors = (mode) => Object.keys(light).map((k) => `        val ${k} = Color(${argb(mode[k])})`).join('\n');
const kotlin = `// ${header}
package com.agentic.app.designsystem

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

object DesignTokens {
    object Light {
${kotlinColors(light)}
    }

    object Dark {
${kotlinColors(dark)}
    }

    object Space {
${Object.keys(tokens.core.space).map((k) => `        val ${k} = ${px('space', k)}.dp`).join('\n')}
    }

    object Radius {
${Object.keys(tokens.core.radius).filter((k) => k !== 'pill').map((k) => `        val ${k} = ${px('radius', k)}.dp`).join('\n')}
    }
}
`;

const outputs = [
  ['apps/web-app/src/styles/tokens.css', css],
  ['apps/back-office/src/styles/tokens.css', css],
  ['apps/website/tokens.css', css],
  ['apps/ios/AgenticApp/DesignSystem/DesignTokens.swift', swift],
  ['apps/android/app/src/main/kotlin/com/agentic/app/designsystem/DesignTokens.kt', kotlin],
];

// Accessibility (ADR-0011): WCAG 2.2 AA contrast for every text colour, and 3:1 for control borders,
// in light and dark mode, on both background and surface. Fails generation and the CI check.
const luminance = (value) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const contrastRules = [
  ...['textPrimary', 'textSecondary', 'primary', 'primaryHover', 'success', 'warning', 'error']
    .flatMap((fg) => ['background', 'surface'].map((bg) => [fg, bg, 4.5])),
  ['onPrimary', 'primary', 4.5],
  ['onPrimary', 'primaryHover', 4.5],
  ['controlBorder', 'background', 3],
  ['controlBorder', 'surface', 3],
];
const failures = [];
for (const [mode, colors] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, minimum] of contrastRules) {
    const ratio = contrast(colors[fg], colors[bg]);
    if (ratio < minimum) failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`);
  }
}
if (failures.length) {
  console.error(`Colour contrast below WCAG 2.2 AA (docs/adr/0011-accessibility.md):\n${failures.join('\n')}`);
  process.exit(1);
}

let stale = [];
for (const [rel, content] of outputs) {
  const file = join(root, rel);
  const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
  if (current === content) continue;
  if (check) stale.push(rel);
  else writeFileSync(file, content);
}
if (check && stale.length) {
  console.error(`Design tokens out of date. Run: node design/build.mjs\n${stale.join('\n')}`);
  process.exit(1);
}
console.log(`${check ? 'Design tokens are up to date.' : `Wrote ${outputs.length} files.`} Contrast meets WCAG 2.2 AA (${contrastRules.length * 2} pairs).`);
