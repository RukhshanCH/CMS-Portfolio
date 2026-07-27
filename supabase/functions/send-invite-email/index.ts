// ============================================
// supabase/functions/send-invite-email/index.ts
// SendGrid — with full response logging for debugging
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, token, portfolioId, invitedBy } = body;

    console.log('📨 send-invite-email invoked');
    console.log('   to:', email);
    console.log('   portfolioId:', portfolioId);

    if (!email || !token || !portfolioId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: portfolio, error: pErr } = await supabaseAdmin
      .from('portfolios')
      .select('title, slug')
      .eq('id', portfolioId)
      .single();

    if (pErr || !portfolio) {
      return new Response(
        JSON.stringify({ error: 'Portfolio not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: inviter } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', invitedBy)
      .single();

    const inviterName = inviter?.full_name || inviter?.email || 'Someone';
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const inviteUrl = `${appUrl}/invite/${token}?email=${encodeURIComponent(email)}`;

    // ─── SENDGRID ───
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const VERIFIED_SENDER_EMAIL = Deno.env.get('VERIFIED_SENDER_EMAIL') || 'rukhshanshahid.work@gmail.com';

    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'SENDGRID_API_KEY not configured', inviteUrl }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📤 Sending via SendGrid from:', VERIFIED_SENDER_EMAIL);

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: VERIFIED_SENDER_EMAIL, name: 'Portfolio App' },
        subject: `${inviterName} invited you to collaborate on "${portfolio.title}"`,
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
              <h2>You've been invited! 🎉</h2>
              <p><strong>${inviterName}</strong> invited you to collaborate on <strong>"${portfolio.title}"</strong>.</p>
              <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px;">Accept Invitation</a>
              <p style="margin-top: 20px; font-size: 13px; color: #666;">Or copy: <code>${inviteUrl}</code></p>
              <p style="font-size: 12px; color: #999;">Expires in 7 days.</p>
            </div>
          `,
        }],
      }),
    });

    // SendGrid returns 202 on success (not 200)
    if (res.status === 202) {
      // SendGrid returns message ID in X-Message-Id header
      const messageId = res.headers.get('x-message-id');
      console.log('✅ SendGrid accepted email. Message-ID:', messageId);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Invitation email queued',
          messageId,
          inviteUrl,
          note: 'Check spam folder if not received. Trace in SendGrid dashboard with Message-ID.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const errText = await res.text();
    console.error('❌ SendGrid error:', res.status, errText);
    return new Response(
      JSON.stringify({ error: 'SendGrid API error', status: res.status, details: errText }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Edge function crash:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});