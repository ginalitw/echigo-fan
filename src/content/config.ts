import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
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
    status: z.string().default('已發佈'),
    lead: z.string().optional(),
    date: z.date().optional(),
    prevSlug: z.string().optional(),
    nextSlug: z.string().optional(),
    threads: z.string().optional(),
  }),
});

const frf = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    n: z.string().optional(),
    meta: z.string().optional(),
    audience: z.array(z.string()).default([]),
    stage: z.string().optional(),
    topics: z.array(z.string()).optional(),
    pillar: z.string().optional(),
    cover: z.string().optional(),
    status: z.string().default('公開'),
  }),
});

export const collections = { posts, frf };
