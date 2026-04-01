import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ClipboardList, Wrench, Users, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reports", label: "Reportes", icon: ClipboardList },
    { href: "/equipment", label: "Equipos", icon: Wrench },
    { href: "/users", label: "Usuarios", icon: Users },
  ];

  return (
    <aside className="w-64 bg-sidebar flex-shrink-0 flex flex-col border-r border-sidebar-accent h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-accent/50">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide">Nexus<span className="text-primary font-light">Maint</span></span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menú Principal</div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              isActive 
                ? "bg-primary text-white shadow-md shadow-primary/10" 
                : "text-slate-300 hover:bg-sidebar-accent hover:text-white"
            )}>
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-accent/50">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-300 hover:bg-sidebar-accent hover:text-red-400 transition-all duration-200">
          <LogOut className="w-5 h-5 text-slate-400" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
