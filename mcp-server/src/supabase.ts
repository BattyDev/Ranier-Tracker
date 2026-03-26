import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabase(url: string, serviceKey: string): SupabaseClient {
  return createClient(url, serviceKey);
}

export type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SHARED_SECRET?: string;
};
