import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import WasteChart from "@/components/WasteChart";

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

const Dashboard = () => {
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
    const channel = supabase.channel("reports-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "waste_reports" }, () => fetchReports())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = reports.filter(r =>
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.waste_type.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Reports", value: reports.length, icon: FileText, color: "text-primary" },
    { label: "Pending", value: reports.filter(r => r.status === "pending").length, icon: Clock, color: "text-status-pending" },
    { label: "In Progress", value: reports.filter(r => r.status === "in_progress").length, icon: AlertTriangle, color: "text-status-in-progress" },
    { label: "Completed", value: reports.filter(r => r.status === "completed").length, icon: CheckCircle, color: "text-status-completed" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all waste reports</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold font-display mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-10 h-10 ${s.color} opacity-60`} />
              </div>
            </motion.div>
          ))}
        </div>

        <WasteChart reports={reports} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Reports</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No reports found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{r.location}</td>
                      <td className="py-3 px-4 max-w-[200px] truncate">{r.description}</td>
                      <td className="py-3 px-4 capitalize">{r.waste_type.replace("_", "-")}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${priorityClasses[r.priority]}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusClasses[r.status]}`}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
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

export default Dashboard;
