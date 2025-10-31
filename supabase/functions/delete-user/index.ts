import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle();

    console.log('Admin check:', { userId: user.id, profile, profileError });

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can delete users');
    }

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Attempting to delete user:', userId);

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      throw new Error(`Failed to delete auth user: ${deleteAuthError.message}`);
    }

    console.log('Auth user deleted, now deleting profile');

    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('Error deleting profile:', deleteProfileError);
      throw new Error(`Failed to delete profile: ${deleteProfileError.message}`);
    }

    console.log('User deletion complete:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});