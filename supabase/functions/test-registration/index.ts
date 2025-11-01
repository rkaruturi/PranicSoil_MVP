import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const testEmail = `testrancher${Date.now()}@test.com`;
    const testPassword = 'TestPass123!';

    console.log('Testing rancher registration for:', testEmail);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data, error } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'rancher',
          full_name: 'Test Rancher',
          phone: '555-7777',
          ranch_size: '500 acres',
          livestock_types: 'Cattle, Sheep',
          grazing_management: 'Rotational'
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          details: error 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created:', data.user?.id);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .maybeSingle();

    const { data: farm, error: farmError } = await supabaseAdmin
      .from('farms')
      .select('*')
      .eq('profile_id', data.user?.id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        user: data.user,
        profile: profile,
        profileError: profileError,
        farm: farm,
        farmError: farmError
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Exception:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});