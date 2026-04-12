import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
/** Prefer explicit name; many dashboards label it service_role only */
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase env: set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) to the service_role secret from Supabase → Settings → API.'
  );
}

// Publishable / anon-style keys cannot bypass RLS; uploads then fail with "row level security policy"
if (
  supabaseServiceKey.startsWith('sb_publishable_') ||
  supabaseServiceKey === 'your_supabase_service_role_key_here'
) {
  throw new Error(
    'SUPABASE_SERVICE_KEY must be the service_role secret (long JWT starting with eyJ...), not the publishable key. Supabase Dashboard → Project Settings → API → service_role → Reveal.'
  );
}

// Service role client - bypasses RLS for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('patients').select('id').limit(1);
    if (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
}
