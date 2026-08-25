import { useEffect, useState } from "react";
import { Check, Eye, LockKeyhole, Shield, ShieldCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Role = { id: string; name: string; code: string; description: string | null; permissions: string[] };
const roleMeta: Record<string, { icon: typeof Shield; color: string; scope: string }> = {
  ADMIN: { icon: ShieldCheck, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", scope: "Acceso total" },
  DIRECTOR: { icon: Shield, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", scope: "Artístico y operativo" },
  ADMINISTRATION: { icon: UsersRound, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", scope: "Comercial y financiero" },
  MUSICIAN: { icon: UsersRound, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", scope: "Portal personal" },
  VIEWER: { icon: Eye, color: "bg-slate-500/10 text-slate-600 dark:text-slate-300", scope: "Solo lectura" },
};
const permissionNames: Record<string, string> = { "dashboard.view": "Dashboard", "organization.manage": "Organización", "users.view": "Usuarios", "users.approve": "Aprobaciones", "roles.manage": "Roles", "musicians.manage": "Músicos", "rehearsals.manage": "Ensayos", "events.manage": "Eventos", "repertoire.manage": "Repertorio", "technical.manage": "Producción técnica", "clients.manage": "Clientes", "quotes.manage": "Cotizaciones", "finances.manage": "Finanzas", "portal.use": "Mi espacio", "reports.view": "Reportes", "audit.view": "Auditoría" };

export default function Roles() {
  const { membership } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!membership) return;
    supabase.from("roles").select("id,name,code,description,role_permissions(permission:permissions(key))").eq("organization_id", membership.organizationId).order("created_at").then(({ data, error }) => {
      if (error) toast.error("No fue posible cargar los roles");
      const rows = (data ?? []) as unknown as Array<{ id: string; name: string; code: string; description: string | null; role_permissions: Array<{ permission: { key: string } | null }> }>;
      setRoles(rows.map(row => ({ id: row.id, name: row.name, code: row.code, description: row.description, permissions: row.role_permissions.flatMap(item => item.permission?.key ? [item.permission.key] : []) })));
      setLoading(false);
    });
  }, [membership]);

  return <div className="space-y-6 animate-in fade-in duration-300"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Control de acceso</p><h1 className="mt-2 text-3xl font-black tracking-tight">Roles y permisos</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Matriz base de responsabilidades. Los permisos se aplican en la interfaz y en las políticas de seguridad de la base de datos.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading ? [1,2,3,4,5].map(i => <Skeleton key={i} className="h-72 rounded-3xl" />) : roles.map(role => { const meta = roleMeta[role.code] ?? roleMeta.VIEWER; return <Card key={role.id} className="rounded-[1.75rem] shadow-none transition-transform hover:-translate-y-1"><CardContent className="p-5"><div className="flex items-start justify-between"><span className={`grid size-12 place-items-center rounded-2xl ${meta.color}`}><meta.icon className="size-5" /></span><Badge variant="outline" className="rounded-lg text-[10px]">SISTEMA</Badge></div><h2 className="mt-5 text-xl font-black">{role.name}</h2><p className="mt-1 text-sm text-muted-foreground">{role.description}</p><Badge className={`mt-4 rounded-lg ${meta.color}`}>{meta.scope}</Badge><div className="mt-5 border-t pt-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{role.permissions.length} permisos asignados</p><div className="flex flex-wrap gap-2">{role.permissions.slice(0, 7).map(permission => <span key={permission} className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold"><Check className="size-3 text-emerald-600" />{permissionNames[permission] ?? permission}</span>)}{role.permissions.length > 7 && <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">+{role.permissions.length - 7}</span>}</div></div></CardContent></Card>; })}</div><div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-bold">Principio de mínimo privilegio</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Los roles del sistema son protegidos. La personalización avanzada de permisos se habilitará cuando existan módulos operativos sobre los cuales aplicarlos.</p></div></div></div>;
}
