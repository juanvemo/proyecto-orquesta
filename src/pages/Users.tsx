import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Eye, MoreHorizontal, Search, ShieldCheck, UserCheck, UserRoundPen, UserRoundX, UsersRound } from "lucide-react";
import { MusicianApplicationDialog, type MusicianApplication } from "@/components/admin/MusicianApplicationDialog";
import { UserEditDialog } from "@/components/admin/UserEditDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Role = { id: string; name: string; code: string };
type Profile = { id: string; first_name: string | null; last_name: string | null; email: string | null; avatar_url: string | null };
type Member = { id: string; user_id: string; role_id: string; approval_status: string; created_at: string; profile?: Profile; role?: Role; musician?: MusicianApplication };

const statusStyle: Record<string, string> = { APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400", REJECTED: "bg-rose-500/10 text-rose-700 dark:text-rose-400", SUSPENDED: "bg-slate-500/10 text-slate-700 dark:text-slate-300" };
const statusText: Record<string, string> = { APPROVED: "Aprobado", PENDING: "Pendiente", REJECTED: "Rechazado", SUSPENDED: "Suspendido" };

export default function Users() {
  const { membership, session, hasPermission, refreshAccess } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState<Member | null>(null);
  const [reviewingUser, setReviewingUser] = useState<Member | null>(null);

  const load = useCallback(async () => {
    if (!membership) return;
    setLoading(true);
    const [membersResult, rolesResult] = await Promise.all([
      supabase.from("organization_memberships").select("id,user_id,role_id,approval_status,created_at").eq("organization_id", membership.organizationId).order("created_at", { ascending: false }),
      supabase.from("roles").select("id,name,code").eq("organization_id", membership.organizationId).order("name"),
    ]);
    if (membersResult.error || rolesResult.error) { toast.error("No fue posible cargar los usuarios"); setLoading(false); return; }
    const rawMembers = membersResult.data ?? [];
    const ids = rawMembers.map((item) => item.user_id);
    const [profilesResult, musiciansResult] = await Promise.all([
      ids.length ? supabase.from("profiles").select("id,first_name,last_name,email,avatar_url").in("id", ids) : Promise.resolve({ data: [], error: null }),
      ids.length ? supabase.from("musicians").select("id,user_id,first_name,last_name,email,phone,whatsapp,address,eps,cali_commune,emergency_contact_name,emergency_contact_phone,status,musician_instruments(is_primary,instrument:instruments(name)),musician_roles(is_primary,musical_role:musical_roles(name))").eq("organization_id", membership.organizationId).in("user_id", ids) : Promise.resolve({ data: [], error: null }),
    ]);
    const profileMap = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
    const musicianMap = new Map((musiciansResult.data ?? []).map((musician) => [musician.user_id, musician as unknown as MusicianApplication]));
    const roleMap = new Map((rolesResult.data ?? []).map((role) => [role.id, role]));
    setRoles(rolesResult.data ?? []);
    setMembers(rawMembers.map((item) => ({ ...item, profile: profileMap.get(item.user_id), role: roleMap.get(item.role_id), musician: musicianMap.get(item.user_id) })));
    setLoading(false);
  }, [membership]);

  useEffect(() => { void load(); }, [load]);

  const updateMember = async (member: Member, changes: { approval_status?: string; role_id?: string }) => {
    const approvalChange = changes.approval_status;
    const payload = { ...changes, ...(approvalChange === "APPROVED" ? { approved_by: session?.user.id, approved_at: new Date().toISOString() } : {}) };
    const { error } = await supabase.from("organization_memberships").update(payload).eq("id", member.id);
    if (error) { toast.error("No se pudo actualizar el acceso", { description: error.message }); return; }
    await supabase.from("audit_logs").insert({ organization_id: membership!.organizationId, user_id: session!.user.id, action: approvalChange === "APPROVED" ? "APPROVE" : "UPDATE", entity_type: "organization_membership", entity_id: member.id, previous_value: { status: member.approval_status, role_id: member.role_id }, new_value: changes });
    toast.success(approvalChange === "APPROVED" ? "Usuario aprobado" : "Acceso actualizado");
    void load();
  };

  const filtered = useMemo(() => members.filter((member) => `${member.profile?.first_name ?? ""} ${member.profile?.last_name ?? ""} ${member.profile?.email ?? ""}`.toLowerCase().includes(query.toLowerCase())), [members, query]);
  const pending = members.filter((member) => member.approval_status === "PENDING").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Administración</p><h1 className="mt-2 text-3xl font-black tracking-tight">Usuarios y acceso</h1><p className="mt-2 text-sm text-muted-foreground">Aprueba solicitudes y asigna responsabilidades dentro de la organización.</p></div><Badge className="w-fit rounded-xl bg-amber-500/10 px-3 py-2 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"><Clock3 className="mr-2 size-4" /> {pending} pendientes</Badge></div>
      <div className="grid gap-4 sm:grid-cols-3"><Card className="rounded-3xl shadow-none"><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><UsersRound className="size-5" /></span><div><p className="text-2xl font-black">{members.length}</p><p className="text-xs text-muted-foreground">Usuarios registrados</p></div></CardContent></Card><Card className="rounded-3xl shadow-none"><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600"><UserCheck className="size-5" /></span><div><p className="text-2xl font-black">{members.filter(m => m.approval_status === "APPROVED").length}</p><p className="text-xs text-muted-foreground">Accesos activos</p></div></CardContent></Card><Card className="rounded-3xl shadow-none"><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-600"><ShieldCheck className="size-5" /></span><div><p className="text-2xl font-black">{roles.length}</p><p className="text-xs text-muted-foreground">Roles definidos</p></div></CardContent></Card></div>
      <Card className="overflow-hidden rounded-[2rem] shadow-none"><div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">Equipo con acceso</p><p className="text-xs text-muted-foreground">Toda alta nueva permanece pendiente hasta su aprobación.</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario…" className="rounded-xl pl-9" /></div></div><CardContent className="p-0">
        {loading ? <div className="space-y-3 p-5">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div> : filtered.length ? <div className="divide-y">{filtered.map((member) => { const name = `${member.profile?.first_name ?? "Usuario"} ${member.profile?.last_name ?? ""}`.trim(); return <div key={member.id} className="grid gap-4 p-4 sm:grid-cols-[1.4fr_.8fr_.7fr_auto] sm:items-center sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-black text-primary">{name.slice(0,2).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{name}</p><p className="truncate text-xs text-muted-foreground">{member.profile?.email ?? "Correo no disponible"}</p></div></div><Select value={member.role_id} disabled={!hasPermission("users.approve")} onValueChange={(role_id) => void updateMember(member, { role_id })}><SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{roles.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectContent></Select><Badge className={`w-fit rounded-lg ${statusStyle[member.approval_status]}`}>{statusText[member.approval_status]}</Badge>{hasPermission("users.approve") ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="rounded-xl">{member.musician && <DropdownMenuItem onClick={() => setReviewingUser(member)}><Eye className="mr-2 size-4 text-violet-600" /> Revisar solicitud musical</DropdownMenuItem>}<DropdownMenuItem onClick={() => setEditingUser(member)}><UserRoundPen className="mr-2 size-4 text-primary" /> Editar usuario y clave</DropdownMenuItem><DropdownMenuItem disabled={member.approval_status === "APPROVED"} onClick={() => void updateMember(member, { approval_status: "APPROVED" })}><CheckCircle2 className="mr-2 size-4 text-emerald-600" /> Aprobar acceso</DropdownMenuItem><DropdownMenuItem onClick={() => void updateMember(member, { approval_status: "SUSPENDED" })}><UserRoundX className="mr-2 size-4 text-orange-600" /> Suspender</DropdownMenuItem><DropdownMenuItem onClick={() => void updateMember(member, { approval_status: "REJECTED" })} className="text-destructive"><UserRoundX className="mr-2 size-4" /> Rechazar</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <span />}</div>; })}</div> : <div className="p-12 text-center"><img src="/assets/music-operations-empty.png" alt="Sin usuarios" className="mx-auto h-32 w-auto rounded-2xl" /><p className="mt-4 font-bold">No encontramos usuarios</p><p className="text-sm text-muted-foreground">Prueba con otro término de búsqueda.</p></div>}
      </CardContent></Card>
      {membership && <UserEditDialog open={Boolean(editingUser)} onOpenChange={(open) => { if (!open) setEditingUser(null); }} user={editingUser} organizationId={membership.organizationId} onSaved={() => { void load(); void refreshAccess(); }} />}
      <MusicianApplicationDialog open={Boolean(reviewingUser)} onOpenChange={(open) => { if (!open) setReviewingUser(null); }} application={reviewingUser?.musician ?? null} pending={reviewingUser?.approval_status === "PENDING"} onApprove={() => { if (reviewingUser) void updateMember(reviewingUser, { approval_status: "APPROVED" }).then(() => setReviewingUser(null)); }} />
    </div>
  );
}
