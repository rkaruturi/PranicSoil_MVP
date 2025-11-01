import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
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
          persistSession: false
        }
      }
    );

    console.log('Checking for existing admin user...');
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    
    const adminExists = existingUser?.users?.some(u => u.email === 'admin@pranicsoil.com');

    if (adminExists) {
      console.log('Admin user already exists');
      return new Response(
        JSON.stringify({ success: true, message: 'Admin user already exists' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Creating admin user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@pranicsoil.com',
      password: 'Admin@PranicSoil2024',
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('Admin user created:', authData.user.id);
    console.log('Updating profile role...');

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: 'admin',
        full_name: 'System Administrator',
        email_confirmed: true 
      })
      .eq('user_id', authData.user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully. You can now login with admin@pranicsoil.com',
        userId: authData.user.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});