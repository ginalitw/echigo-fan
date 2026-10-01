// 圖片的尺寸與小圖版本。
//
// 為什麼要這個：Notion 同步下來的原圖是 1600px、動輒 300–470KB，
// 手機只需要 800px。建置完成後 astro.config.mjs 的 imageVariants 會替每張
// 寬度超過 900px 的圖產生 `-480.webp` 與 `-800.webp` 兩份，這裡負責在 HTML 裡寫好
// width / height（防版面跳動）和 srcset（讓手機只下載小圖）。
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

export const VARIANT_W = 800;
export const WIDTHS = [480, 800];
const cache = new Map<string, { width: number; height: number } | null>();

export function variantPath(src: string, w = VARIANT_W) {
  return src.replace(/\.(jpe?g|png|webp)$/i, `-${w}.webp`);
}

export async function imgInfo(src?: string | null) {
  if (!src || !src.startsWith('/')) return null;
  if (cache.has(src)) return cache.get(src)!;
  const file = path.join(process.cwd(), 'public', decodeURIComponent(src));
  let info: { width: number; height: number } | null = null;
  if (fs.existsSync(file)) {
    const m = await sharp(file).metadata();
    const rotated = (m.orientation ?? 1) >= 5;
    if (m.width && m.height) {
      info = rotated ? { width: m.height, height: m.width } : { width: m.width, height: m.height };
    }
  }
  cache.set(src, info);
  return info;
}

/** 回傳可以直接展開在 <img> 上的屬性。 */
export async function imgAttrs(src: string, sizes = '100vw') {
  const info = await imgInfo(src);
  if (!info) return { src };
  const hasVariant = info.width > VARIANT_W + 100;
  return {
    src,
    width: info.width,
    height: info.height,
    ...(hasVariant
      ? { srcset: [...WIDTHS.map((w) => `${variantPath(src, w)} ${w}w`), `${src} ${info.width}w`].join(', '), sizes }
      : {}),
  };
}
