import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.array(z.enum(['越後大地藝術祭', '富士搖滾二三事', '我吃的不只是飯', '里山人文和風土'])),
    location: z.string().optional(),
    season: z.array(z.enum(['春', '夏', '秋', '冬'])).optional(),
    postType: z.enum(['作品單篇', '一日遊全記錄', '實務提醒', '飯食', '風土隨筆']).optional(),
    artist: z.array(z.string()).optional(),
    artworkNumber: z.string().optional(),
    artworkName: z.string().optional(),
    status: z.enum(['待填', '草稿', '已發布']).default('已發布'),
    lead: z.string().optional(),
    date: z.date().optional(),
    prevSlug: z.string().optional(),
    nextSlug: z.string().optional(),
    threads: z.string().optional(),
  }),
});

export const collections = { posts };
