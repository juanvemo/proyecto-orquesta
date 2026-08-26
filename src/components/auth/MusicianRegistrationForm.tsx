import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, MailCheck, Music2, ShieldCheck, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl } from "@/lib/authRedirect";

type CatalogItem = { id: string; name: string; category?: string };
type RegistrationCatalog = { organization_name: string; instruments: CatalogItem[]; roles: CatalogItem[] };
type FormValues = { firstName: string; lastName: string; email: string; password: string; phone: string; whatsapp: string; address: string; eps: string; commune: string; emergencyName: string; emergencyPhone: string; instrumentId: string; roleId: string; };
const empty: FormValues = { firstName: "", lastName: "", email: "", password: "", phone: "", whatsapp: "", address: "", eps: "", commune: "", emergencyName: "", emergencyPhone: "", instrumentId: "", roleId: "" };

export function MusicianRegistrationForm() {
  const [values, setValues] = useState(empty);
  const [catalog, setCatalog] = useState<RegistrationCatalog | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  useEffect(() => {
    supabase.rpc("get_registration_catalogs").then(({ data, error }) => {
      if (error) toast.error("No fue posible cargar instrumentos y roles", { description: error.message });
      else setCatalog(data as RegistrationCatalog);
      setLoadingCatalog(false);
    });
  }, []);

  const change = (key: keyof FormValues, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if ([values.firstName, values.lastName, values.email, values.phone, values.address, values.eps, values.emergencyName, values.emergencyPhone].some((value) => value.trim().length < 2)) { toast.error("Completa todos los campos obligatorios"); return; }
    if (!values.instrumentId && !values.roleId) { toast.error("Selecciona al menos un instrumento o un rol musical"); return; }
    if (values.password.length < 8) { toast.error("La contraseña debe tener mínimo 8 caracteres"); return; }
    if (!accepted) { toast.error("Debes autorizar el tratamiento de la información"); return; }
    setSaving(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          first_name: values.firstName.trim(), last_name: values.lastName.trim(), phone: values.phone.trim(), whatsapp: values.whatsapp.trim(),
          address: values.address.trim(), eps: values.eps.trim(), cali_commune: values.commune || null,
          emergency_contact_name: values.emergencyName.trim(), emergency_contact_phone: values.emergencyPhone.trim(),
          instrument_id: values.instrumentId || null, musical_role_id: values.roleId || null,
          registration_type: "musician",
        },
      },
    });
    setSaving(false);
    if (error) { toast.error("No fue posible enviar la solicitud", { description: translateError(error.message) }); return; }
    toast.success("Solicitud creada correctamente");
    if (!data.session) setEmailSent(values.email.trim());
    setValues(empty);
  };

  if (emailSent) return <div className="rounded-3xl border bg-card p-6 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600"><MailCheck className="size-7" /></span><h3 className="mt-4 text-xl font-black">Confirma tu correo</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Enviamos un enlace a <strong>{emailSent}</strong>. Ábrelo para confirmar tu cuenta.</p><div className="mt-5 rounded-2xl bg-primary/5 p-4 text-left text-sm leading-relaxed"><p className="font-black text-primary">¿Qué pasa después?</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground"><li>La dirección revisará y aprobará tu solicitud.</li><li>Una vez aprobada, regresa al portal.</li><li>Ingresa con este correo y la contraseña que acabas de crear.</li></ol></div><Button type="button" variant="outline" className="mt-5 rounded-xl" onClick={() => setEmailSent("")}>Registrar otro correo</Button></div>;

  return <form onSubmit={submit} className="space-y-6">
    <div className="rounded-2xl bg-primary/5 p-4"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><UserRoundPlus className="size-5" /></span><div><p className="font-black">Solicitud de acceso para músicos</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Crearemos tu ficha musical y la dirección revisará la solicitud. Después de ser aprobado, debes ingresar al portal con tu correo y contraseña.</p></div></div></div>
    <section><SectionTitle number="1" title="Tu cuenta" /><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Nombre *" value={values.firstName} onChange={(value) => change("firstName", value)} /><Field label="Apellidos *" value={values.lastName} onChange={(value) => change("lastName", value)} /><Field label="Correo electrónico *" type="email" value={values.email} onChange={(value) => change("email", value)} /><Field label="Contraseña *" type="password" value={values.password} onChange={(value) => change("password", value)} hint="Mínimo 8 caracteres" /></div></section>
    <section><SectionTitle number="2" title="Contacto y salud" /><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Teléfono *" type="tel" value={values.phone} onChange={(value) => change("phone", value)} /><Field label="WhatsApp" type="tel" value={values.whatsapp} onChange={(value) => change("whatsapp", value)} /><div className="sm:col-span-2"><Field label="Dirección de residencia *" value={values.address} onChange={(value) => change("address", value)} /></div><Field label="EPS *" value={values.eps} onChange={(value) => change("eps", value)} placeholder="Ej. Sura, Nueva EPS" /><div><Label>Comuna de Cali <span className="font-normal text-muted-foreground">(opcional)</span></Label><Select value={values.commune || "NONE"} onValueChange={(value) => change("commune", value === "NONE" ? "" : value)}><SelectTrigger className="mt-2 h-11 rounded-xl"><SelectValue placeholder="Seleccionar comuna" /></SelectTrigger><SelectContent><SelectItem value="NONE">Prefiero no indicarla</SelectItem>{Array.from({ length: 22 }, (_, index) => String(index + 1)).map((value) => <SelectItem key={value} value={value}>Comuna {value}</SelectItem>)}</SelectContent></Select></div><Field label="Contacto de emergencia *" value={values.emergencyName} onChange={(value) => change("emergencyName", value)} /><Field label="Teléfono de emergencia *" type="tel" value={values.emergencyPhone} onChange={(value) => change("emergencyPhone", value)} /></div></section>
    <section><SectionTitle number="3" title="Tu lugar en la orquesta" /><p className="mt-2 text-xs text-muted-foreground">Debes seleccionar por lo menos un instrumento o un rol. Puedes completar ambos.</p>{loadingCatalog ? <div className="mt-4 flex h-24 items-center justify-center rounded-2xl border"><LoaderCircle className="size-5 animate-spin text-primary" /></div> : <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><Label>Instrumento principal</Label><Select value={values.instrumentId || "NONE"} onValueChange={(value) => change("instrumentId", value === "NONE" ? "" : value)}><SelectTrigger className="mt-2 h-11 rounded-xl"><SelectValue placeholder="Seleccionar instrumento" /></SelectTrigger><SelectContent><SelectItem value="NONE">No aplica</SelectItem>{catalog?.instruments.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}{item.category ? ` · ${item.category}` : ""}</SelectItem>)}</SelectContent></Select></div><div><Label>Rol musical principal</Label><Select value={values.roleId || "NONE"} onValueChange={(value) => change("roleId", value === "NONE" ? "" : value)}><SelectTrigger className="mt-2 h-11 rounded-xl"><SelectValue placeholder="Seleccionar rol" /></SelectTrigger><SelectContent><SelectItem value="NONE">No aplica</SelectItem>{catalog?.roles.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div></div>}</section>
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-muted/25 p-4"><Checkbox checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} className="mt-0.5" /><span className="text-xs leading-relaxed text-muted-foreground">Autorizo el tratamiento de mis datos personales, de salud y contacto de emergencia exclusivamente para la operación y seguridad de la organización.</span></label>
    <Button type="submit" disabled={saving || loadingCatalog} className="h-12 w-full rounded-xl font-black">{saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <ShieldCheck className="mr-2 size-4" />} Enviar solicitud de acceso</Button>
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="size-3.5 text-emerald-600" /> La comuna es el único dato opcional de esta sección territorial.</div>
  </form>;
}
function SectionTitle({ number, title }: { number: string; title: string }) { return <div className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">{number}</span><h3 className="font-black">{title}</h3></div>; }
function Field({ label, value, onChange, type = "text", placeholder, hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; hint?: string }) { return <div><Label>{label}</Label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={label.includes("*")} className="mt-2 h-11 rounded-xl" />{hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}</div>; }
function translateError(message: string) { if (message.toLowerCase().includes("already registered")) return "Este correo ya está registrado."; if (message.includes("instrument_or_role_required")) return "Selecciona un instrumento o rol válido."; if (message.includes("missing_musician_registration_data")) return "Completa todos los datos personales y de emergencia."; return message; }
