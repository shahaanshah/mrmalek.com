import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const logos = [
  {
    name: 'aslagrodrain',
    dir: 'public/images/companies',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <defs>
    <linearGradient id="aslGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#aslGrad)" stroke-width="4" stroke-linecap="round">
    <path d="M 40 100 C 60 70, 80 70, 100 100 C 120 130, 140 130, 160 100"/>
    <path d="M 40 80 C 60 50, 80 50, 100 80 C 120 110, 140 110, 160 80"/>
    <path d="M 40 60 C 60 30, 80 30, 100 60 C 120 90, 140 90, 160 60"/>
  </g>
  <text x="180" y="85" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" letter-spacing="3">ASL</text>
  <text x="182" y="118" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" letter-spacing="6">AGRODRAIN</text>
</svg>`,
  },
  {
    name: 'pass-on',
    dir: 'public/images/companies',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <defs>
    <linearGradient id="passGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <g transform="translate(30, 35)">
    <rect x="0" y="10" width="60" height="60" rx="14" fill="none" stroke="#ffffff" stroke-width="5"/>
    <path d="M 25 40 L 45 40 M 35 30 L 45 40 L 35 50" stroke="url(#passGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="68" cy="22" r="6" fill="#38bdf8"/>
  </g>
  <text x="125" y="92" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="800" letter-spacing="4">PASS ON</text>
  <text x="128" y="122" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" letter-spacing="7">LOGISTICS</text>
</svg>`,
  },
  {
    name: 'lendo',
    dir: 'public/images/companies',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <defs>
    <linearGradient id="lendoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <g transform="translate(35, 40)">
    <circle cx="36" cy="36" r="32" fill="none" stroke="url(#lendoGrad)" stroke-width="6"/>
    <path d="M 24 48 L 48 24 M 48 24 L 34 24 M 48 24 L 48 38" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="125" y="94" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="800" letter-spacing="2">lendo</text>
  <circle cx="270" cy="90" r="5" fill="#10b981"/>
</svg>`,
  },
  {
    name: 'malekting',
    dir: 'public/images/ventures',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <defs>
    <linearGradient id="mktGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <g transform="translate(35, 38)">
    <rect x="0" y="0" width="72" height="72" rx="20" fill="url(#mktGrad)"/>
    <path d="M 22 50 L 34 38 L 44 44 L 54 26 M 46 26 L 54 26 L 54 34" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="135" y="85" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" letter-spacing="1">MALEKTING</text>
  <text x="137" y="112" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" letter-spacing="3">DIGITAL GROWTH &amp; PERFORMANCE</text>
</svg>`,
  },
  {
    name: 'malektness',
    dir: 'public/images/ventures',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <defs>
    <linearGradient id="fitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>
  <g transform="translate(35, 38)">
    <rect x="0" y="0" width="72" height="72" rx="20" fill="url(#fitGrad)"/>
    <path d="M 24 36 L 48 36 M 20 30 L 20 42 M 28 26 L 28 46 M 52 30 L 52 42 M 44 26 L 44 46" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
  </g>
  <text x="135" y="85" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" letter-spacing="1">MALEKTNESS</text>
  <text x="137" y="112" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" letter-spacing="3">PERFORMANCE SYSTEMS</text>
</svg>`,
  },
  {
    name: 'ai-voice',
    dir: 'public/images/ventures',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
  <defs>
    <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <g transform="translate(35, 38)">
    <rect x="0" y="0" width="72" height="72" rx="20" fill="url(#aiGrad)"/>
    <path d="M 36 24 C 31 24, 28 28, 28 33 L 28 42 C 28 47, 31 51, 36 51 C 41 51, 44 47, 44 42 L 44 33 C 44 28, 41 24, 36 24 Z M 22 39 C 22 47, 28 54, 36 54 C 44 54, 50 47, 50 39 M 36 54 L 36 60 M 30 60 L 42 60" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="135" y="85" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="800" letter-spacing="1">AI VOICE AGENTS</text>
  <text x="137" y="112" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" letter-spacing="3">CONVERSATIONAL AUTOMATION</text>
</svg>`,
  },
];

for (const logo of logos) {
  const tmpSvg = path.join('/tmp', `${logo.name}.svg`);
  fs.writeFileSync(tmpSvg, logo.svg, 'utf8');

  // Also write the SVG file into the public directory as an asset
  const targetSvg = path.join(logo.dir, `${logo.name}.svg`);
  fs.writeFileSync(targetSvg, logo.svg, 'utf8');

  // Convert to high-res PNG thumbnail via qlmanage
  try {
    execSync(`qlmanage -t -s 600 -o /tmp ${tmpSvg} > /dev/null 2>&1`);
    const generatedPng = `/tmp/${logo.name}.svg.png`;
    const targetPng = path.join(logo.dir, `${logo.name}.png`);
    if (fs.existsSync(generatedPng)) {
      fs.copyFileSync(generatedPng, targetPng);
      console.log(`Generated: ${targetPng} (${fs.statSync(targetPng).size} bytes)`);
    } else {
      console.warn(`PNG not generated, SVG available at ${targetSvg}`);
    }
  } catch (err) {
    console.error(`Error converting ${logo.name}:`, err.message);
  }
}
