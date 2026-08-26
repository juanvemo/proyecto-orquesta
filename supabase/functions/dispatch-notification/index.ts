import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const defaultAppUrl = "https://juanvemo.github.io/proyecto-orquesta.github.io/#";
const publishableKey = "sb_publishable_YYiMh83YIXkArkNagHQR2g_EVQQZx6e";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] ?? character));
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  return digits;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authorization = req.headers.get("Authorization");
    if (authorization !== `Bearer ${anonKey}` && authorization !== `Bearer ${publishableKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    }

    const { notification_id: notificationId } = await req.json();
    if (!notificationId) return new Response(JSON.stringify({ error: "notification_id is required" }), { status: 400, headers });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: notification, error: notificationError } = await admin
      .from("notifications")
      .select("id,organization_id,user_id,title,message,link")
      .eq("id", notificationId)
      .single();
    if (notificationError || !notification) return new Response(JSON.stringify({ error: "Notification not found" }), { status: 404, headers });

    const [{ data: profile }, { data: musician }, { data: preferences }] = await Promise.all([
      admin.from("profiles").select("first_name,last_name,email").eq("id", notification.user_id).maybeSingle(),
      admin.from("musicians").select("whatsapp").eq("organization_id", notification.organization_id).eq("user_id", notification.user_id).maybeSingle(),
      admin.from("notification_preferences").select("whatsapp_enabled").eq("user_id", notification.user_id).maybeSingle(),
    ]);

    const appUrl = Deno.env.get("APP_BASE_URL") ?? defaultAppUrl;
    const notificationUrl = notification.link ? `${appUrl}${notification.link}` : appUrl.replace(/#$/, "");
    const results: Record<string, string> = {};

    if (profile?.email) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const fromEmail = Deno.env.get("NOTIFICATION_FROM_EMAIL");
      if (resendKey && fromEmail) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromEmail,
            to: [profile.email],
            subject: notification.title,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#211b31"><h1 style="font-size:22px">${escapeHtml(notification.title)}</h1><p style="font-size:16px;line-height:1.6">${escapeHtml(notification.message)}</p><a href="${escapeHtml(notificationUrl)}" style="display:inline-block;margin-top:16px;padding:12px 18px;border-radius:12px;background:#5B21F4;color:#fff;text-decoration:none;font-weight:700">Abrir Proyecto Orquesta</a></div>`,
          }),
        });
        const payload = await response.json();
        await admin.from("notification_deliveries").upsert({ notification_id: notification.id, organization_id: notification.organization_id, user_id: notification.user_id, channel: "EMAIL", status: response.ok ? "SENT" : "FAILED", provider_message_id: payload.id ?? null, error_message: response.ok ? null : JSON.stringify(payload), attempted_at: new Date().toISOString(), sent_at: response.ok ? new Date().toISOString() : null }, { onConflict: "notification_id,channel" });
        results.email = response.ok ? "sent" : "failed";
      } else {
        await admin.from("notification_deliveries").upsert({ notification_id: notification.id, organization_id: notification.organization_id, user_id: notification.user_id, channel: "EMAIL", status: "NOT_CONFIGURED", error_message: "RESEND_API_KEY or NOTIFICATION_FROM_EMAIL missing", attempted_at: new Date().toISOString() }, { onConflict: "notification_id,channel" });
        results.email = "not_configured";
      }
    }

    if (preferences?.whatsapp_enabled && musician?.whatsapp) {
      const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
      const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
      const templateName = Deno.env.get("WHATSAPP_TEMPLATE_NAME") ?? "notificacion_proyecto_orquesta";
      const templateLanguage = Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") ?? "es_CO";
      if (whatsappToken && phoneNumberId) {
        const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${whatsappToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to: normalizePhone(musician.whatsapp), type: "template", template: { name: templateName, language: { code: templateLanguage }, components: [{ type: "body", parameters: [{ type: "text", text: notification.title }, { type: "text", text: notification.message }, { type: "text", text: notificationUrl }] }] } }),
        });
        const payload = await response.json();
        await admin.from("notification_deliveries").upsert({ notification_id: notification.id, organization_id: notification.organization_id, user_id: notification.user_id, channel: "WHATSAPP", status: response.ok ? "SENT" : "FAILED", provider_message_id: payload.messages?.[0]?.id ?? null, error_message: response.ok ? null : JSON.stringify(payload), attempted_at: new Date().toISOString(), sent_at: response.ok ? new Date().toISOString() : null }, { onConflict: "notification_id,channel" });
        results.whatsapp = response.ok ? "sent" : "failed";
      } else {
        await admin.from("notification_deliveries").upsert({ notification_id: notification.id, organization_id: notification.organization_id, user_id: notification.user_id, channel: "WHATSAPP", status: "NOT_CONFIGURED", error_message: "WhatsApp Cloud API credentials missing", attempted_at: new Date().toISOString() }, { onConflict: "notification_id,channel" });
        results.whatsapp = "not_configured";
      }
    }

    console.log("[dispatch-notification] Notification processed", { notificationId, results });
    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers });
  } catch (error) {
    console.error("[dispatch-notification] Dispatch failed", { error: error instanceof Error ? error.message : String(error) });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }), { status: 500, headers });
  }
});
