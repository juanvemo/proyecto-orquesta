import { FormEvent, useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { ArrowRight, CheckCircle2, KeyRound, Music2, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { MusicianRegistrationForm } from "@/components/auth/MusicianRegistrationForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { session, membership, loading } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && membership?.approvalStatus === "PENDING") navigate("/acceso-pendiente", { replace: true });
  }, [loading, session, membership, navigate]);

  if (!loading && session && membership?.approvalStatus === "APPROVED") return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-[#f6f4fb] p-3 dark:bg-[#0d0b16] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[2rem] border border-white/70 bg-background shadow-2xl shadow-violet-950/10 dark:border-white/10 lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <img src="/assets/orquesta-stage-hero.png" alt="Orquesta tropical en escenario" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#151029]/45" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
            <div className="w-fit rounded-2xl bg-white/90 p-3 shadow-xl backdrop-blur">
              <img src="/assets/proyecto-orquesta-logo.png" alt="Proyecto Orquesta" className="h-20 w-auto" />
            </div>
            <div className="max-w-xl text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Music2 className="size-4 text-violet-300" /> El sistema operativo de tu orquesta
              </div>
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight xl:text-6xl">Toda la operación.<br />Un mismo compás.</h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 xl:text-lg">Dirección artística, administración, producción y finanzas conectadas en una plataforma profesional.</p>
              <div className="mt-8 flex gap-6 text-sm text-white/80">
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-violet-300" /> Multi-organización</span>
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-violet-300" /> Acceso por roles</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-2xl">
            <img src="/assets/proyecto-orquesta-logo.png" alt="Proyecto Orquesta" className="mx-auto mb-8 h-24 w-auto lg:hidden" />
            <div className="mb-8">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">Orquesta Gestión</p>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Bienvenido al escenario</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Inicia sesión o solicita acceso como músico. Todas las altas nuevas requieren aprobación de la dirección.</p>
            </div>
            <div className="auth-orquesta rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
              <Tabs defaultValue="signin">
                <TabsList className="mb-6 grid h-auto w-full grid-cols-3 rounded-2xl p-1.5">
                  <TabsTrigger value="signin" className="rounded-xl">Ingresar</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl">Registrarme</TabsTrigger>
                  <TabsTrigger value="reset" className="rounded-xl">Recuperar</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <Auth
                    supabaseClient={supabase}
                    providers={[]}
                    view="sign_in"
                    showLinks={false}
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    appearance={{
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: "#5B21F4",
                            brandAccent: "#4918d0",
                            inputBorder: resolvedTheme === "dark" ? "#352f47" : "#ddd7ea",
                            inputText: resolvedTheme === "dark" ? "#faf8ff" : "#201a2d",
                          },
                          radii: { borderRadiusButton: "14px", inputBorderRadius: "14px" },
                          space: { inputPadding: "13px 14px", buttonPadding: "13px 16px" },
                        },
                      },
                      className: { button: "font-bold shadow-none transition-transform hover:-translate-y-0.5", input: "font-medium", anchor: "font-semibold", label: "font-semibold" },
                    }}
                    localization={{ variables: { sign_in: { email_label: "Correo electrónico", password_label: "Contraseña", button_label: "Entrar a Gestión", loading_button_label: "Ingresando…" } } }}
                    redirectTo={window.location.origin}
                  />
                </TabsContent>
                <TabsContent value="signup"><MusicianRegistrationForm /></TabsContent>
                <TabsContent value="reset"><PasswordResetForm /></TabsContent>
              </Tabs>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><ShieldCheck className="size-3.5" /> Acceso protegido y aislado por organización <ArrowRight className="size-3.5" /></p>
          </div>
        </section>
      </div>
    </main>
  );
}

function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/actualizar-clave` });
    setSending(false);
    if (error) toast.error("No fue posible enviar las instrucciones", { description: error.message });
    else toast.success("Revisa tu correo para restablecer la contraseña");
  };
  return <form onSubmit={submit} className="space-y-5 py-2"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><KeyRound className="size-5" /></span><div><h3 className="text-xl font-black">Recuperar contraseña</h3><p className="mt-1 text-sm text-muted-foreground">Te enviaremos un enlace seguro a tu correo registrado.</p></div><div><Label>Correo electrónico</Label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 h-11 rounded-xl" /></div><Button disabled={sending} className="h-11 w-full rounded-xl font-bold">{sending ? "Enviando…" : "Enviar instrucciones"}</Button></form>;
}
