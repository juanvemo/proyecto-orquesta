import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { assetUrl } from "@/lib/assets";

export default function ResetPassword() {
  const navigate = useNavigate(); const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (password.length < 8) { toast.error("La contraseña debe tener mínimo 8 caracteres"); return; } if (password !== confirmation) { toast.error("Las contraseñas no coinciden"); return; } setSaving(true); const { error } = await supabase.auth.updateUser({ password }); setSaving(false); if (error) { toast.error("No fue posible actualizar la contraseña", { description: error.message }); return; } toast.success("Contraseña actualizada"); navigate("/", { replace: true }); };
  return <main className="grid min-h-screen place-items-center bg-[#f6f4fb] p-5 dark:bg-[#0d0b16]"><Card className="w-full max-w-md rounded-[2rem] shadow-xl"><CardContent className="p-6 sm:p-8"><img src={assetUrl("/assets/proyecto-orquesta-logo.png")} alt="Proyecto Orquesta" className="mx-auto h-20 w-auto" /><span className="mx-auto mt-6 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><KeyRound className="size-6" /></span><div className="mt-5 text-center"><h1 className="text-2xl font-black">Crea una nueva contraseña</h1><p className="mt-2 text-sm text-muted-foreground">Usa una clave segura de mínimo 8 caracteres.</p></div><form onSubmit={submit} className="mt-7 space-y-5"><div><Label>Nueva contraseña</Label><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-2 h-11 rounded-xl" /></div><div><Label>Confirmar contraseña</Label><Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required className="mt-2 h-11 rounded-xl" /></div><Button disabled={saving} className="h-12 w-full rounded-xl font-black">{saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <ShieldCheck className="mr-2 size-4" />} Guardar contraseña</Button></form></CardContent></Card></main>;
}
