import type { LucideIcon } from "lucide-react";
import { Boxes, CalendarCheck2, CalendarDays, CircleDollarSign, ClipboardList, ContactRound, FileText, Gauge, Music2, PackageOpen, Settings, SlidersHorizontal, Sparkles, UsersRound, UserRoundCog } from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: string;
  phase?: number;
}

export const navigationGroups: { label: string; items: NavItem[] }[] = [
  { label: "Principal", items: [
    { label: "Dashboard", path: "/", icon: Gauge, permission: "dashboard.view" },
    { label: "Mi disponibilidad", path: "/mi-disponibilidad", icon: CalendarCheck2, permission: "portal.use" },
    { label: "Calendario", path: "/calendario", icon: CalendarDays, phase: 3 },
  ] },
  { label: "Operación musical", items: [
    { label: "Músicos", path: "/musicos", icon: UsersRound, permission: "musicians.view" },
    { label: "Ensayos", path: "/ensayos", icon: ClipboardList, phase: 3 },
    { label: "Repertorio", path: "/repertorio", icon: Music2, phase: 4 },
    { label: "Eventos", path: "/eventos", icon: Sparkles, phase: 6 },
    { label: "Producción técnica", path: "/produccion", icon: SlidersHorizontal, phase: 7 },
  ] },
  { label: "Gestión", items: [
    { label: "Clientes y CRM", path: "/clientes", icon: ContactRound, phase: 5 },
    { label: "Cotizaciones", path: "/cotizaciones", icon: FileText, phase: 5 },
    { label: "Finanzas", path: "/finanzas", icon: CircleDollarSign, phase: 8 },
    { label: "Inventario", path: "/inventario", icon: PackageOpen, phase: 9 },
  ] },
  { label: "Administración", items: [
    { label: "Usuarios", path: "/usuarios", icon: UserRoundCog, permission: "users.view" },
    { label: "Roles y permisos", path: "/roles", icon: Boxes, permission: "roles.manage" },
    { label: "Configuración", path: "/configuracion", icon: Settings, permission: "organization.manage" },
  ] },
];
