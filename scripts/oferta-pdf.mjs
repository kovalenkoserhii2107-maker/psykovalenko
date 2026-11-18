#!/usr/bin/env node
/**
 * PDF договору оферти: друкує сторінку /offer/ із готової збірки (out/)
 * у public/oferta.pdf. PDF і сторінка — один і той самий HTML, тож не
 * розходяться.
 *
 *   python3 scripts/oferta-html.py         # якщо змінився .docx
 *   npm run build                          # зібрати out/
 *   node scripts/oferta-pdf.mjs            # надрукувати PDF
 *   npm run build                          # щоб новий PDF потрапив в out/
 *
 * Потрібен Chromium. Якщо Playwright не знаходить свій, шлях до браузера
 * задається змінною CHROME=/шлях/до/chrome.
 */
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'out');
const TARGET = join(ROOT, 'public', 'oferta.pdf');
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain',
};

// out/ роздаємо під тим самим префіксом, з яким його зібрано
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  let file = join(OUT, p);
  try {
    if ((await stat(file).catch(() => null))?.isDirectory() ?? true) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
try {
  const page = await browser.newPage();
  const resp = await page.goto(`http://127.0.0.1:${port}${BASE}/offer/`, { waitUntil: 'load' });
  if (!resp?.ok()) throw new Error(`сторінка /offer/ не відкрилась (${resp?.status()}): чи зібрано out/?`);
  await page.evaluate(() => document.fonts.ready);

  const footer = `
    <div style="width:100%;padding:0 16mm;font-family:sans-serif;font-size:7.5pt;color:#6B6472;
                display:flex;justify-content:space-between;">
      <span>Публічний договір (оферта) · ФОП Коваленко Т. В.</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`;

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: footer,
    outline: true,
    tagged: true,
  });
  await writeFile(TARGET, pdf);
  console.log(`oferta-pdf: ${(pdf.length / 1024).toFixed(0)} КБ → public/oferta.pdf`);
} finally {
  await browser.close();
  server.close();
}
