import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { navigationGroups } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, onOpenChange]);

  const items = useMemo(() => navigationGroups.flatMap((group) => group.items)
    .filter((item) => !item.phase && (!item.permission || hasPermission(item.permission)))
    .filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query, hasPermission]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[15%] translate-y-0 gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Búsqueda global</DialogTitle>
        <div className="flex items-center border-b px-5">
          <Search className="size-5 text-muted-foreground" />
          <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en Orquesta Gestión…" className="h-16 border-0 bg-transparent text-base shadow-none focus-visible:ring-0" />
          <kbd className="rounded-lg border bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Accesos disponibles</p>
          {items.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); onOpenChange(false); setQuery(""); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-primary/8">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><item.icon className="size-5" /></span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
          {!items.length && <div className="py-10 text-center"><Sparkles className="mx-auto size-7 text-primary" /><p className="mt-3 font-semibold">Sin resultados en la Fase 1</p><p className="text-sm text-muted-foreground">Los nuevos módulos se incorporarán por fases.</p></div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
