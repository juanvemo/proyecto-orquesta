import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Filter, ListFilter, Search, SlidersHorizontal, UserCheck, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CatalogManager } from "@/features/musicians/CatalogManager";
import { getMusicianCatalogs, listMusicians } from "@/features/musicians/service";
import type { Instrument, MusicalRole, Musician } from "@/features/musicians/types";

const statusTone: Record<string, string> = { ACTIVO: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", INACTIVO: "bg-slate-500/10 text-slate-700 dark:text-slate-300", INVITADO: "bg-blue-500/10 text-blue-700 dark:text-blue-400", SUPLENTE: "bg-amber-500/10 text-amber-700 dark:text-amber-400", "PROFESIONAL DE APOYO": "bg-violet-500/10 text-violet-700 dark:text-violet-400" };

export default function Musicians() {
  const { membership, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [roles, setRoles] = useState<MusicalRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [instrument, setInstrument] = useState("ALL");
  const canManage = hasPermission("musicians.manage");

  const load = useCallback(async () => {
    if (!membership) return;
    setLoading(true);
    try { const [people, catalogs] = await Promise.all([listMusicians(membership.organizationId), getMusicianCatalogs(membership.organizationId)]); setMusicians(people); setInstruments(catalogs.instruments); setRoles(catalogs.roles); }
    catch (error) { toast.error("No fue posible cargar el módulo", { description: error instanceof Error ? error.message : undefined }); }
    finally { setLoading(false); }
  }, [membership]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => musicians.filter((musician) => {
    const text = `${musician.first_name} ${musician.last_name} ${musician.email ?? ""} ${musician.specialty ?? ""}`.toLowerCase();
    const instrumentMatch = instrument === "ALL" || musician.musician_instruments.some((item) => item.instrument?.id === instrument);
    return text.includes(query.toLowerCase()) && (status === "ALL" || musician.status === status) && instrumentMatch;
  }), [musicians, query, status, instrument]);

  const active = musicians.filter((item) => item.status === "ACTIVO").length;
  const available = musicians.filter((item) => item.availability.some((entry) => entry.status === "DISPONIBLE")).length;

  return <div className="space-y-6 animate-in fade-in duration-300"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Operación musical</p><h1 className="mt-2 text-3xl font-black tracking-tight">Músicos</h1><p className="mt-2 text-sm text-muted-foreground">Directorio artístico, roles, instrumentos, tarifas y disponibilidad.</p></div><Badge variant="outline" className="w-fit rounded-xl">Las fichas nacen del registro de usuarios</Badge></div>
    <div className="grid gap-4 sm:grid-cols-3"><Metric icon={UsersRound} label="Total registrados" value={musicians.length} tone="bg-primary/10 text-primary" /><Metric icon={UserCheck} label="Músicos activos" value={active} tone="bg-emerald-500/10 text-emerald-600" /><Metric icon={ListFilter} label="Con disponibilidad" value={available} tone="bg-blue-500/10 text-blue-600" /></div>
    <Tabs defaultValue="directory" className="space-y-5"><TabsList className="h-auto rounded-2xl p-1.5"><TabsTrigger value="directory" className="rounded-xl"><UsersRound className="mr-2 size-4" /> Directorio</TabsTrigger><TabsTrigger value="catalogs" className="rounded-xl"><SlidersHorizontal className="mr-2 size-4" /> Catálogos</TabsTrigger></TabsList>
      <TabsContent value="directory" className="space-y-4"><Card className="rounded-[2rem] shadow-none"><CardContent className="p-4 sm:p-5"><div className="grid gap-3 lg:grid-cols-[1fr_210px_210px]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo o especialidad…" className="h-11 rounded-xl pl-9" /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-11 rounded-xl"><Filter className="mr-2 size-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Todos los estados</SelectItem>{Object.keys(statusTone).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Select value={instrument} onValueChange={setInstrument}><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Instrumento" /></SelectTrigger><SelectContent><SelectItem value="ALL">Todos los instrumentos</SelectItem>{instruments.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
        {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <Skeleton key={item} className="h-56 rounded-[2rem]" />)}</div> : filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((musician) => <button key={musician.id} onClick={() => navigate(`/musicos/${musician.id}`)} className="group text-left"><Card className="h-full rounded-[2rem] shadow-none transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg"><CardContent className="p-5"><div className="flex items-start gap-4"><span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/10 text-lg font-black text-primary">{musician.photo_url ? <img src={musician.photo_url} alt="" className="h-full w-full object-cover" /> : `${musician.first_name[0]}${musician.last_name[0]}`}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h2 className="truncate text-lg font-black">{musician.first_name} {musician.last_name}</h2><p className="truncate text-sm text-muted-foreground">{musician.musician_roles.find((item) => item.is_primary)?.musical_role?.name ?? musician.specialty ?? "Sin rol principal"}</p></div><ChevronRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div></div></div><div className="mt-5 flex flex-wrap gap-2"><Badge className={`rounded-lg ${statusTone[musician.status]}`}>{musician.status}</Badge>{musician.musician_instruments.map((item) => item.instrument && <Badge key={item.id} variant="outline" className="rounded-lg">{item.instrument.name}</Badge>)}</div><div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-xs"><div><p className="text-muted-foreground">Nivel</p><p className="mt-1 font-bold">{musician.level}</p></div><div><p className="text-muted-foreground">Tarifa evento</p><p className="mt-1 font-bold">{formatMoney(musician.event_rate)}</p></div></div></CardContent></Card></button>)}</div> : <Card className="rounded-[2rem] shadow-none"><CardContent className="p-12 text-center"><img src="/assets/music-operations-empty.png" alt="Sin resultados" className="mx-auto h-36 rounded-2xl" /><h2 className="mt-5 text-xl font-black">No encontramos músicos</h2><p className="mt-2 text-sm text-muted-foreground">Ajusta los filtros o aprueba un usuario nuevo para crear su ficha vinculada.</p></CardContent></Card>}
      </TabsContent><TabsContent value="catalogs"><CatalogManager organizationId={membership?.organizationId ?? ""} instruments={instruments} roles={roles} canManage={canManage} onChanged={() => void load()} /></TabsContent></Tabs>
  </div>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof UsersRound; label: string; value: number; tone: string }) { return <Card className="rounded-3xl shadow-none"><CardContent className="flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-2xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-2xl font-black">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></CardContent></Card>; }
function formatMoney(value: number) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value); }
