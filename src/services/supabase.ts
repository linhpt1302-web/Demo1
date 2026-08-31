import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function normalizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  // Strip trailing /rest/v1 or /rest/v1/ if user pasted endpoint
  url = url.replace(/\/rest\/v1\/?$/, '');
  // Strip trailing slash
  url = url.replace(/\/+$/, '');
  return url;
}

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const rawUrl = url || import.meta.env.VITE_SUPABASE_URL;
  const finalKey = (anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();

  if (!rawUrl || !finalKey) {
    return null;
  }

  const finalUrl = normalizeSupabaseUrl(rawUrl);

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(finalUrl, finalKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Không thể khởi tạo Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

export function resetSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  try {
    const finalUrl = normalizeSupabaseUrl(url);
    const finalKey = anonKey.trim();
    supabaseClient = createClient(finalUrl, finalKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseClient;
  } catch (e) {
    console.error('Lỗi khi thiết lập Supabase client mới:', e);
    return null;
  }
}
