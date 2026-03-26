import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";

interface Report {
  id: string;
  location: string;
  description: string;
  waste_type: string;
  priority: string;
  status: string;
  created_at: string;
}

const statusClasses: Record<string, string> = {
  pending: "status-pending",
  in_progress: "status-in-progress",
  completed: "status-completed",
};

const priorityClasses: Record<string, string> = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    const { data } = await supabase.from("waste_reports").select("*").order("created_at", { ascending: false });
    if (data) setReports(data as Report[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    const channel = supabase.channel("admin-reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "waste_reports" }, () => fetchReports())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("waste_reports").update({ status: status as "pending" | "in_progress" | "completed" }).eq("id", id);
    if (error) toast.error("Failed to update status");
    else toast.success("Status updated!");
  };

  const updatePriority = async (id: string, priority: string) => {
    const { error } = await supabase.from("waste_reports").update({ priority: priority as "high" | "medium" | "low" }).eq("id", id);
    if (error) toast.error("Failed to update priority");
    else toast.success("Priority updated!");
  };

  if (!authLoading && !isAdmin) return <Navigate to="/dashboard" />;

  const filtered = reports.filter(r =>
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage all waste reports</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">All Reports ({reports.length})</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 font-medium">{r.location}</td>
                      <td className="py-3 px-3 max-w-[180px] truncate">{r.description}</td>
                      <td className="py-3 px-3 capitalize">{r.waste_type.replace("_", "-")}</td>
                      <td className="py-3 px-3">
                        <Select value={r.priority} onValueChange={v => updatePriority(r.id, v)}>
                          <SelectTrigger className={`w-28 h-8 text-xs ${priorityClasses[r.priority]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">🔴 High</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="low">🟢 Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-3">
                        <Select value={r.status} onValueChange={v => updateStatus(r.id, v)}>
                          <SelectTrigger className={`w-32 h-8 text-xs ${statusClasses[r.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
