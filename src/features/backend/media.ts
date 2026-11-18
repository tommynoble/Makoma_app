import { useEffect, useState } from 'react';
import { File } from 'expo-file-system';
import { supabase } from '@/lib/supabase';

/**
 * Storage helpers. Buckets are private: files are uploaded under the user's id
 * and shown through short-lived signed URLs (RLS decides who may sign them).
 * A stored reference looks like "sb:<bucket>/<path>".
 */
export type Bucket = 'profile-photos' | 'voice-intros' | 'voice-notes' | 'verification-selfies';

const TTL_SECONDS = 6 * 3600;
const cache = new Map<string, { url: string; expires: number }>();

export const toRef = (bucket: Bucket, path: string) => `sb:${bucket}/${path}`;
export const isRef = (v: unknown): v is string => typeof v === 'string' && v.startsWith('sb:');
export function parseRef(ref: string): { bucket: Bucket; path: string } {
  const rest = ref.slice(3);
  const i = rest.indexOf('/');
  return { bucket: rest.slice(0, i) as Bucket, path: rest.slice(i + 1) };
}

async function readBytes(uri: string): Promise<ArrayBuffer> {
  if (process.env.EXPO_OS === 'web' || uri.startsWith('blob:') || uri.startsWith('data:')) return (await fetch(uri)).arrayBuffer();
  return new File(uri).arrayBuffer();
}

export async function uploadLocal(bucket: Bucket, path: string, uri: string, contentType: string) {
  const bytes = await readBytes(uri);
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;
  return path;
}

/** Signed URLs for many paths in one bucket (cached until shortly before they expire). */
export async function signPaths(bucket: Bucket, paths: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const todo: string[] = [];
  const now = Date.now();
  for (const p of new Set(paths.filter(Boolean))) {
    const hit = cache.get(`${bucket}/${p}`);
    if (hit && hit.expires > now + 60_000) out[p] = hit.url;
    else todo.push(p);
  }
  if (todo.length) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrls(todo, TTL_SECONDS);
    if (error) throw error;
    for (const row of data ?? []) {
      if (!row.path || !row.signedUrl) continue;
      out[row.path] = row.signedUrl;
      cache.set(`${bucket}/${row.path}`, { url: row.signedUrl, expires: now + TTL_SECONDS * 1000 });
    }
  }
  return out;
}

/** Resolve a list of image sources, swapping "sb:" references for signed URLs. */
export function useResolvedSources<T extends string | number>(sources: T[]): (T | string)[] {
  const refs = sources.filter(isRef) as string[];
  const key = refs.join('|');
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!key) return;
    let alive = true;
    const byBucket = new Map<Bucket, string[]>();
    for (const r of key.split('|')) {
      const { bucket, path } = parseRef(r);
      byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), path]);
    }
    Promise.all([...byBucket].map(async ([b, ps]) => [b, await signPaths(b, ps)] as const))
      .then((res) => {
        if (!alive) return;
        const next: Record<string, string> = {};
        for (const [b, urls] of res) for (const [p, u] of Object.entries(urls)) next[toRef(b, p)] = u;
        setMap(next);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);
  return sources.map((s) => (isRef(s) ? (map[s] ?? '') : s));
}
