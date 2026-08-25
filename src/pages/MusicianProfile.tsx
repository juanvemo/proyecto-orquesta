import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CircleDollarSign, Clock3, Edit3, Mail, MapPin, Music2, Phone, ShieldCheck, Star, UserCheck, UsersRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { AvailabilityManager } from "@/features/musicians/AvailabilityManager";
import { MusicianFormDialog } from "@/features/musicians/MusicianFormDialog";
import { getMusician, getMusicianCatalogs } from "@/features/musicians/service";
import { supabase } from "@/integrations/supabase/client";
import type { Instrument, MusicalRole, Musician } from "@/features/musicians/types";

const statusTone: Record<string, string> = { ACTIVO: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", INACTIVO: "bg-slate-500/10 text-slate-700 dark:text-slate-300", INVITADO: "bg-blue-500/10 text-blue-700 dark:text-blue-400", SUPLENTE: "bg-amber-500/10 text-amber-700 dark:text-amber-400", "PROFESIONAL DE APOYO": "bg-violet-500/10 text-violet-700 dark:text-violet-400" };

export default function MusicianProfile() {
  const { id } = useParams();
  const { membership, session, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [musician, setMusician] = useState<Musician | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [roles, setRoles] = useState<MusicalRole[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ attended: 0, absences: 0 });
  const [activityStats, setActivityStats] = useState({ events: 0, paidContributions: 0, pendingContributions: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const canManage = hasPermission("musicians.manage");

  const load = useCallback(async () => {
    if (!membership || !id) return;
    setLoading(true);
    try {
      const [person, catalogs, attendanceResult, eventsResult, contributionsResult] = await Promise.all([getMusician(membership.organizationId, id), getMusicianCatalogs(membership.organizationId), supabase.from("rehearsal_attendance").select("status").eq("organization_id", membership.organizationId).eq("musician_id", id), supabase.from("event_musicians").select("id", { count: "exact" }).eq("organization_id", membership.organizationId).eq("musician_id", id), supabase.from("rehearsal_contributions").select("status").eq("organization_id", membership.organizationId).eq("musician_id", id)]);
      setMusician(person); setInstruments(catalogs.instruments); setRoles(catalogs.roles);
      const attendance = attendanceResult.data ?? [];
      const contributions = contributionsResult.data ?? [];
      setAttendanceStats({ attended: attendance.filter((item) => item.status === "PRESENTE" || item.status === "TARDE").length, absences: attendance.filter((item) => item.status === "AUSENTE" || item.status === "JUSTIFICADO").length });
      setActivityStats({ events: eventsResult.count ?? 0, paidContributions: contributions.filter((item) => item.status === "PAGADO").length, pendingContributions: contributions.filter((item) => item.status === "PENDIENTE").length });
    }
    catch { toast.error("No fue posible cargar la ficha"); navigate("/musicos", { replace: true }); }
    finally { setLoading(false); }
  }, [membership, id, navigate]);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="space-y-5"><Skeleton className="h-44 rounded-[2rem]" /><Skeleton className="h-96 rounded-[2rem]" /></div>;
  if (!musician || !membership) return null;
  const primaryInstrument = musician.musician_instruments.find((item) => item.is_primary)?.instrument?.name ?? "Sin instrumento principal";
  const primaryRole = musician.musician_roles.find((item) => item.is_primary)?.musical_role?.name ?? "Sin rol principal";

  return <div className="space-y-6 animate-in fade-in duration-300"><div className="flex items-center justify-between"><Button variant="ghost" className="rounded-xl" onClick={() => navigate("/musicos")}><ArrowLeft className="mr-2 size-4" /> Directorio</Button>{canManage && <Button onClick={() => setEditing(true)} className="rounded-xl font-bold"><Edit3 className="mr-2 size-4" /> Editar ficha</Button>}</div>
    <section className="relative overflow-hidden rounded-[2rem] border bg-card p-5 shadow-none sm:p-7"><div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-center"><span className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-[2rem] bg-primary/10 text-3xl font-black text-primary">{musician.photo_url ? <img src={musician.photo_url} alt={`${musician.first_name} ${musician.last_name}`} className="h-full w-full object-cover" /> : `${musician.first_name[0]}${musician.last_name[0]}`}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge className={`rounded-lg ${statusTone[musician.status]}`}>{musician.status}</Badge><Badge variant="outline" className="rounded-lg">{musician.level}</Badge></div><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{musician.first_name} {musician.last_name}</h1><p className="mt-2 text-sm font-semibold text-primary">{primaryRole} · {primaryInstrument}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">{musician.city && <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {musician.city}</span>}{musician.phone && <span className="flex items-center gap-1.5"><Phone className="size-4" /> {musician.phone}</span>}{musician.email && <span className="flex items-center gap-1.5"><Mail className="size-4" /> {musician.email}</span>}</div></div></div></section>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={CalendarDays} value={attendanceStats.attended.toString()} label="Ensayos asistidos" note="Incluye llegadas tarde" /><Stat icon={UserCheck} value={attendanceStats.absences.toString()} label="Ausencias" note="Incluye justificadas" /><Stat icon={CircleDollarSign} value={formatMoney(musician.event_rate)} label="Tarifa por evento" note="COP" /><Stat icon={Clock3} value={musician.experience_years?.toString() ?? "—"} label="Años de experiencia" note={musician.specialty ?? "Sin especialidad"} /></div>

    <Tabs defaultValue="summary" className="space-y-5"><TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl p-1.5 sm:w-fit"><TabsTrigger value="summary" className="rounded-xl">Resumen</TabsTrigger><TabsTrigger value="availability" className="rounded-xl">Disponibilidad</TabsTrigger><TabsTrigger value="activity" className="rounded-xl">Actividad e historial</TabsTrigger></TabsList>
      <TabsContent value="summary" className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><Card className="rounded-[2rem] shadow-none"><CardContent className="p-5 sm:p-6"><h2 className="text-lg font-black">Perfil musical</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{musician.biography || "Sin biografía registrada."}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Info label="Especialidad" value={musician.specialty || "Sin especificar"} /><Info label="Participación" value={musician.participation_type || "Sin especificar"} /><Info label="Ingreso" value={formatDate(musician.joined_at)} /><Info label="Tarifa de ensayo" value={formatMoney(musician.rehearsal_rate)} /></div>{musician.observations && <div className="mt-6 rounded-2xl bg-muted/50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Observaciones</p><p className="mt-2 text-sm">{musician.observations}</p></div>}</CardContent></Card><div className="space-y-5"><Card className="rounded-[2rem] shadow-none"><CardContent className="p-5 sm:p-6"><div className="flex items-center gap-2"><Music2 className="size-5 text-primary" /><h2 className="text-lg font-black">Instrumentos</h2></div><div className="mt-4 space-y-2">{musician.musician_instruments.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted/45 p-3"><span className="font-semibold">{item.instrument?.name}</span><div className="flex gap-2">{item.is_primary && <Star className="size-4 fill-primary text-primary" />}<Badge variant="outline" className="rounded-lg text-[9px]">{item.proficiency}</Badge></div></div>)}</div></CardContent></Card><Card className="rounded-[2rem] shadow-none"><CardContent className="p-5 sm:p-6"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><h2 className="text-lg font-black">Roles</h2></div><div className="mt-4 flex flex-wrap gap-2">{musician.musician_roles.map((item) => <Badge key={item.id} variant={item.is_primary ? "default" : "secondary"} className="rounded-xl px-3 py-2">{item.musical_role?.name}{item.is_primary && " · Principal"}</Badge>)}</div></CardContent></Card>{canManage && <Card className="rounded-[2rem] shadow-none"><CardContent className="p-5 sm:p-6"><div className="flex items-center gap-2"><Phone className="size-5 text-primary" /><h2 className="text-lg font-black">Salud y emergencia</h2></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Info label="EPS" value={musician.eps || "Sin registrar"} /><Info label="Comuna" value={musician.cali_commune ? `Comuna ${musician.cali_commune}` : "Sin registrar"} /><Info label="Contacto" value={musician.emergency_contact_name || "Sin registrar"} /><Info label="Teléfono" value={musician.emergency_contact_phone || "Sin registrar"} /><div className="sm:col-span-2"><Info label="Dirección" value={musician.address || "Sin registrar"} /></div></div></CardContent></Card>}</div></TabsContent>
      <TabsContent value="availability"><AvailabilityManager organizationId={membership.organizationId} musicianId={musician.id} entries={musician.availability} canManage={canManage || musician.user_id === session?.user.id} onChanged={() => void load()} /></TabsContent>
      <TabsContent value="activity"><Card className="rounded-[2rem] shadow-none"><CardContent className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><ActivityPanel icon={CalendarDays} title="Ensayos y asistencia" detail={`${attendanceStats.attended + attendanceStats.absences} registros acumulados`} /><ActivityPanel icon={UsersRound} title="Eventos y presentaciones" detail={`${activityStats.events} participaciones registradas`} /><ActivityPanel icon={CircleDollarSign} title="Aportes confirmados" detail={`${activityStats.paidContributions} pagados · ${activityStats.pendingContributions} pendientes`} /><ActivityPanel icon={ShieldCheck} title="Perfil y disponibilidad" detail="Información operativa habilitada" /></CardContent></Card></TabsContent>
    </Tabs>
    <MusicianFormDialog open={editing} onOpenChange={setEditing} organizationId={membership.organizationId} musician={musician} instruments={instruments} roles={roles} onSaved={() => void load()} />
  </div>;
}

function Stat({ icon: Icon, value, label, note }: { icon: typeof CalendarDays; value: string; label: string; note: string }) { return <Card className="rounded-3xl shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-2xl font-black">{value}</p><p className="mt-1 text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-4" /></span></div></CardContent></Card>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }
function ActivityPanel({ icon: Icon, title, detail }: { icon: typeof CalendarDays; title: string; detail: string }) { return <div className="flex items-center gap-4 rounded-2xl border bg-muted/25 p-4"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><div><p className="font-bold">{title}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>; }
function formatMoney(value: number) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(new Date(`${value}T12:00:00`)) : "Sin registrar"; }
