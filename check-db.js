const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: org, error } = await supabase.from('organizations').select('id').eq('owner_user_id', '6a501f1a-2b2d-4aba-9b58-d95e87f09e42').limit(1).maybeSingle();
  console.log('Org:', org);
  if (error) console.error('Error:', error);
}

check();
