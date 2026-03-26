import { LayoutDashboard, FileText, Shield, LogOut, Recycle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, signOut, user } = useAuth();

  const links = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Report Waste", icon: FileText, path: "/report" },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Shield, path: "/admin" }] : []),
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Recycle className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-sidebar-foreground">SmartWaste</h1>
          <p className="text-xs text-sidebar-foreground/60">Reporting System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 mb-3 truncate px-2">
          {user?.email}
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
