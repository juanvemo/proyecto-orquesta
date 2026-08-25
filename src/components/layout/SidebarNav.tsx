import { NavLink } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { navigationGroups } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPermission } = useAuth();

  return (
    <nav className="space-y-6 px-3 pb-6">
      {navigationGroups.map((group) => {
        const visibleItems = group.items.filter((item) => item.phase || !item.permission || hasPermission(item.permission));
        if (!visibleItems.length) return null;
        return (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">{group.label}</p>
            <div className="space-y-1">
              {visibleItems.map((item) => item.phase ? (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/45" aria-label={`${item.label}, disponible en fase ${item.phase}`}>
                      <item.icon className="size-[18px]" /><span className="flex-1 text-left">{item.label}</span><LockKeyhole className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="rounded-xl">Disponible en Fase {item.phase}</TooltipContent>
                </Tooltip>
              ) : (
                <NavLink key={item.path} to={item.path} onClick={onNavigate} className={({ isActive }) => cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                  <item.icon className="size-[18px]" /><span className="flex-1">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
      <div className="mx-1 rounded-2xl border border-primary/15 bg-primary/5 p-3">
        <div className="flex items-center justify-between"><p className="text-xs font-bold text-primary">Portal del músico</p><Badge variant="outline" className="rounded-lg border-primary/20 text-[9px] text-primary">FASE 11</Badge></div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">Perfil, disponibilidad, ensayos y aportes en un acceso personal.</p>
      </div>
    </nav>
  );
}
