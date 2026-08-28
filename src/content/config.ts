import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // 刻意用 z.string() 而非 z.enum()：Notion 上新增一個分類／攻略類型／季節選項時，
    // 不該讓整個網站建置失敗。Notion 的選單本身已經限制了可能的值。
    category: z.array(z.string()),
    location: z.string().optional(),
    season: z.array(z.string()).optional(),
    postType: z.string().optional(),
    artist: z.array(z.string()).optional(),
    artworkNumber: z.string().optional(),
    artworkName: z.string().optional(),
    code: z.string().optional(),
    stamps: z.array(z.string()).optional(),
    cover: z.string().optional(),
    status: z.string().default('已發布'),
    lead: z.string().optional(),
    date: z.date().optional(),
    prevSlug: z.string().optional(),
    nextSlug: z.string().optional(),
    threads: z.string().optional(),
  }),
});

export const collections = { posts };
