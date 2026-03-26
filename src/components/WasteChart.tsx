import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Props {
  reports: { waste_type: string }[];
}

const COLORS = ["hsl(152, 55%, 35%)", "hsl(38, 80%, 55%)", "hsl(200, 60%, 50%)"];

const WasteChart = ({ reports }: Props) => {
  const data = [
    { name: "Biodegradable", value: reports.filter(r => r.waste_type === "biodegradable").length },
    { name: "Non-Biodegradable", value: reports.filter(r => r.waste_type === "non_biodegradable").length },
    { name: "Mixed", value: reports.filter(r => r.waste_type === "mixed").length },
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="font-display text-xl font-semibold mb-4">Waste Type Distribution</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WasteChart;
