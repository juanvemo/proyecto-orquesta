import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute, PermissionRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import CalendarPage from "@/pages/CalendarPage";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import MusicianProfile from "@/pages/MusicianProfile";
import Musicians from "@/pages/Musicians";
import MyAvailability from "@/pages/MyAvailability";
import MyContributions from "@/pages/MyContributions";
import MyProfile from "@/pages/MyProfile";
import PendingApproval from "@/pages/PendingApproval";
import RehearsalControl from "@/pages/RehearsalControl";
import Rehearsals from "@/pages/Rehearsals";
import ResetPassword from "@/pages/ResetPassword";
import Repertoire from "@/pages/Repertoire";
import Roles from "@/pages/Roles";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <Toaster />
          <Sonner richColors position="top-right" />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/actualizar-clave" element={<ResetPassword />} />
                <Route path="/acceso-pendiente" element={<PendingApproval />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route index element={<Index />} />
                    <Route element={<PermissionRoute permission="portal.use" />}>
                      <Route path="mi-perfil" element={<MyProfile />} />
                      <Route path="mi-disponibilidad" element={<MyAvailability />} />
                      <Route path="mis-aportes" element={<MyContributions />} />
                    </Route>
                    <Route element={<PermissionRoute permission="musicians.view" />}>
                      <Route path="musicos" element={<Musicians />} />
                      <Route path="musicos/:id" element={<MusicianProfile />} />
                    </Route>
                    <Route element={<PermissionRoute permission="rehearsals.view" />}>
                      <Route path="calendario" element={<CalendarPage />} />
                      <Route path="ensayos" element={<Rehearsals />} />
                      <Route path="ensayos/:id" element={<RehearsalControl />} />
                    </Route>
                    <Route element={<PermissionRoute permission="repertoire.view" />}>
                      <Route path="repertorio" element={<Repertoire />} />
                    </Route>
                    <Route element={<PermissionRoute permission="users.view" />}>
                      <Route path="usuarios" element={<Users />} />
                    </Route>
                    <Route element={<PermissionRoute permission="roles.manage" />}>
                      <Route path="roles" element={<Roles />} />
                    </Route>
                    <Route element={<PermissionRoute permission="organization.manage" />}>
                      <Route path="configuracion" element={<Settings />} />
                    </Route>
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
