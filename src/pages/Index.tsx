import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, CalendarClock, CheckCircle2, CircleDollarSign, Clock3, FileWarning, MapPin, Music2, TrendingUp, UserCheck, UsersRound, WalletCards } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const financeData = [
  { month: "Oct", ingresos: 7.2, gastos: 4.4 }, { month: "Nov", ingresos: 9.8, gastos: 5.6 },
  { month: "Dic", ingresos: 14.2, gastos: 8.1 }, { month: "Ene", ingresos: 6.4, gastos: 3.9 },
  { month: "Feb", ingresos: 11.6, gastos: 6.2 }, { month: "Mar", ingresos: 13.8, gastos: 7.4 },
];

const metrics = [
  { label: "Ingresos del mes", value: "$13.800.000", note: "+18,4% vs. febrero", icon: ArrowUpRight, tone: "emerald" },
  { label: "Gastos del mes", value: "$7.400.000", note: "53,6% de ingresos", icon: ArrowDownRight, tone: "orange" },
  { label: "Utilidad estimada", value: "$6.400.000", note: "Margen del 46,4%", icon: TrendingUp, tone: "violet" },
  { label: "Por cobrar", value: "$850.000", note: "2 pagos pendientes", icon: WalletCards, tone: "blue" },
];

const alerts = [
  { text: "3 músicos no han confirmado asistencia", detail: "Evento Boda Rivera", level: "Atención", icon: UsersRound, color: "text-orange-600 bg-orange-500/10" },
  { text: "El próximo evento aún no tiene setlist", detail: "Faltan 5 días", level: "Prioridad", icon: Music2, color: "text-violet-600 bg-violet-500/10" },
  { text: "Hay $850.000 pendientes por cobrar", detail: "2 clientes", level: "Finanzas", icon: CircleDollarSign, color: "text-blue-600 bg-blue-500/10" },
  { text: "Rider técnico pendiente de aprobación", detail: "Evento Boda Rivera", level: "Producción", icon: FileWarning, color: "text-rose-600 bg-rose-500/10" },
];

function MetricCard({ item }: { item: typeof metrics[number] }) {
  const tones: Record<string, string> = { emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400", violet: "bg-primary/10 text-primary", blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
  return (
    <Card className="rounded-3xl border shadow-none transition-transform duration-300 hover:-translate-y-1">
      <CardContent className="p-5">
        <div className="flex items-start justify-between"><p className="text-sm font-medium text-muted-foreground">{item.label}</p><span className={`grid size-9 place-items-center rounded-xl ${tones[item.tone]}`}><item.icon className="size-4" /></span></div>
        <p className="mt-5 text-2xl font-black tracking-tight">{item.value}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{item.note}</p>
      </CardContent>
    </Card>
  );
}

export default function Index() {
  const { user, organization, membership } = useAuth();
  const [musicianSummary, setMusicianSummary] = useState({ total: 0, active: 0, available: 0 });

  useEffect(() => {
    if (!membership) return;
    supabase.from("musicians").select("status,availability(status)").eq("organization_id", membership.organizationId).then(({ data }) => {
      const rows = (data ?? []) as Array<{ status: string; availability: Array<{ status: string }> }>;
      setMusicianSummary({ total: rows.length, active: rows.filter((item) => item.status === "ACTIVO").length, available: rows.filter((item) => item.availability.some((entry) => entry.status === "DISPONIBLE")).length });
    });
  }, [membership]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><span className="size-2 rounded-full bg-emerald-500" /> Operación activa</div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Hola, {user?.firstName || "Director"}</h1><p className="mt-2 text-sm text-muted-foreground">Este es el pulso de {organization?.name ?? "Proyecto Orquesta"} para hoy.</p></div>
        <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm"><CalendarClock className="size-4 text-primary" /><div><p className="text-xs text-muted-foreground">Semana operativa</p><p className="font-bold">17 — 23 de marzo</p></div></div>
      </section>

      <section className="relative min-h-[260px] overflow-hidden rounded-[2rem] bg-[#1b1530] text-white shadow-xl shadow-violet-950/15">
        <img src={organization?.coverUrl ?? "/assets/orquesta-stage-hero.png"} alt={`${organization?.name ?? "Proyecto Orquesta"} en escenario`} className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[#160f2b]/45" />
        <div className="relative z-10 flex min-h-[260px] flex-col justify-between p-6 sm:p-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <Badge className="rounded-full border-white/20 bg-white/15 px-3 py-1 text-white hover:bg-white/15">PRÓXIMO EVENTO · CONFIRMADO</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Boda Rivera & Martínez</h2>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80"><span className="flex items-center gap-2"><CalendarClock className="size-4 text-violet-300" /> Sábado 22, 7:30 p. m.</span><span className="flex items-center gap-2"><MapPin className="size-4 text-violet-300" /> Hacienda La Martina, Cali</span></div>
          </div>
          <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md lg:mt-0 lg:w-72">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold">Músicos confirmados</span><strong className="text-lg">11/14</strong></div><Progress value={78} className="mt-3 h-2 bg-white/20" /><div className="mt-4 flex items-center justify-between text-xs text-white/70"><span>3 respuestas pendientes</span><Button size="sm" className="h-8 rounded-lg bg-white px-3 text-[#1b1530] hover:bg-white/90">Ver preparación <ArrowRight className="ml-1 size-3" /></Button></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((item) => <MetricCard key={item.label} item={item} />)}</section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden rounded-[2rem] border shadow-none"><CardContent className="p-0"><div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center sm:p-6"><div><p className="text-lg font-black">Rendimiento financiero</p><p className="text-sm text-muted-foreground">Ingresos y gastos · millones COP</p></div><div className="flex gap-4 text-xs font-semibold"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-primary" /> Ingresos</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-orange-400" /> Gastos</span></div></div><div className="h-[280px] p-4 sm:p-6"><ResponsiveContainer width="100%" height="100%"><AreaChart data={financeData}><defs><linearGradient id="income" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5B21F4" stopOpacity={0.24}/><stop offset="100%" stopColor="#5B21F4" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--border))" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: 16, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" }} formatter={(value: number) => [`$${value.toFixed(1)} M`, ""]} /><Area type="monotone" dataKey="ingresos" stroke="#5B21F4" strokeWidth={3} fill="url(#income)" /><Area type="monotone" dataKey="gastos" stroke="#fb923c" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div></CardContent></Card>

        <Card className="rounded-[2rem] border shadow-none"><CardContent className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-lg font-black">Próximo ensayo</p><p className="text-sm text-muted-foreground">Preparación musical</p></div><span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Music2 className="size-5" /></span></div><div className="mt-6 rounded-2xl bg-muted/55 p-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">Jueves 20 de marzo</p><p className="mt-2 text-xl font-black">Ensayo general</p><div className="mt-4 space-y-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Clock3 className="size-4" /> 7:00 p. m. — 10:00 p. m.</p><p className="flex items-center gap-2"><MapPin className="size-4" /> Sala Ritmo, San Fernando</p><p className="flex items-center gap-2"><Music2 className="size-4" /> 6 canciones por trabajar</p></div></div><div className="mt-5 flex items-center justify-between"><div><p className="text-2xl font-black">9<span className="text-base text-muted-foreground">/12</span></p><p className="text-xs text-muted-foreground">confirmaciones</p></div><div className="flex -space-x-2">{["JR","AM","CL","+6"].map((name) => <span key={name} className="grid size-8 place-items-center rounded-full border-2 border-card bg-primary/15 text-[10px] font-bold text-primary">{name}</span>)}</div></div></CardContent></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="rounded-[2rem] border shadow-none"><CardContent className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-lg font-black">Equipo musical</p><p className="text-sm text-muted-foreground">Datos conectados con el directorio</p></div><UsersRound className="size-5 text-primary" /></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/50 p-4"><p className="text-3xl font-black">{musicianSummary.total}</p><p className="text-xs text-muted-foreground">Total registrados</p></div><div className="rounded-2xl bg-emerald-500/10 p-4"><p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{musicianSummary.active}</p><p className="text-xs text-muted-foreground">Músicos activos</p></div><div className="rounded-2xl bg-blue-500/10 p-4"><p className="text-3xl font-black text-blue-600 dark:text-blue-400">{musicianSummary.available}</p><p className="text-xs text-muted-foreground">Con disponibilidad</p></div><div className="rounded-2xl bg-orange-500/10 p-4"><p className="text-3xl font-black text-orange-600 dark:text-orange-400">3</p><p className="text-xs text-muted-foreground">Pendientes próximo evento</p></div></div></CardContent></Card>

        <Card className="rounded-[2rem] border shadow-none"><CardContent className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-lg font-black">Centro de alertas</p><p className="text-sm text-muted-foreground">Situaciones que requieren atención</p></div><Badge className="rounded-full bg-orange-500/10 text-orange-700 hover:bg-orange-500/10 dark:text-orange-400"><BellRing className="mr-1 size-3" /> 4 activas</Badge></div><div className="mt-5 divide-y">{alerts.map((alert) => <button key={alert.text} className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/30 sm:px-2"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${alert.color}`}><alert.icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{alert.text}</span><span className="text-xs text-muted-foreground">{alert.detail}</span></span><span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:block">{alert.level}</span><ArrowRight className="size-4 text-muted-foreground" /></button>)}</div></CardContent></Card>
      </section>

      <section className="rounded-[2rem] border border-primary/15 bg-primary/5 p-5 sm:flex sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><CheckCircle2 className="size-6" /></span><div><p className="font-black">Fundación operativa y segura</p><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Organización, acceso por roles, aprobación de usuarios y auditoría están listos. Los datos del dashboard son demostrativos hasta conectar los módulos de las siguientes fases.</p></div></div><Badge variant="outline" className="mt-4 rounded-xl border-primary/20 px-3 py-2 text-primary sm:mt-0"><UserCheck className="mr-2 size-4" /> Fase 1</Badge></section>
    </div>
  );
}
