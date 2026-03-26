import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Leaf, Package, HelpCircle } from "lucide-react";

const BIODEGRADABLE_KEYWORDS = ["food", "leaves", "paper", "wood", "compost", "organic", "vegetable", "fruit", "garden", "grass", "plant"];
const NON_BIODEGRADABLE_KEYWORDS = ["plastic", "bottle", "metal", "glass", "electronic", "battery", "rubber", "styrofoam", "polythene", "can", "wire", "nylon"];

const detectWasteType = (text: string): "biodegradable" | "non_biodegradable" | "mixed" => {
  const lower = text.toLowerCase();
  const bio = BIODEGRADABLE_KEYWORDS.some(k => lower.includes(k));
  const nonBio = NON_BIODEGRADABLE_KEYWORDS.some(k => lower.includes(k));
  if (bio && nonBio) return "mixed";
  if (bio) return "biodegradable";
  if (nonBio) return "non_biodegradable";
  return "mixed";
};

const Report = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [loading, setLoading] = useState(false);

  const detectedType = detectWasteType(description);
  const typeInfo = {
    biodegradable: { icon: Leaf, label: "Biodegradable", desc: "Organic waste detected (food, leaves, etc.)", className: "text-primary" },
    non_biodegradable: { icon: Package, label: "Non-Biodegradable", desc: "Non-organic waste detected (plastic, metal, etc.)", className: "text-secondary" },
    mixed: { icon: HelpCircle, label: "Mixed / Unknown", desc: "Type will be auto-detected from description", className: "text-muted-foreground" },
  }[detectedType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) { toast.error("Please fill all fields"); return; }
    if (!user) return;

    setLoading(true);
    const { error } = await supabase.from("waste_reports").insert({
      user_id: user.id,
      location: location.trim(),
      description: description.trim(),
      waste_type: detectedType,
      priority: priority as "high" | "medium" | "low",
    });
    setLoading(false);

    if (error) { toast.error("Failed to submit report"); return; }
    toast.success("Report submitted successfully!");
    setLocation(""); setDescription("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Report Waste</h1>
          <p className="text-muted-foreground mt-1">Submit a new waste report</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Main Street, Block 5" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe the waste... (e.g., pile of plastic bottles near the park)"
                className="min-h-[120px]" />
            </div>

            {description && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <typeInfo.icon className={`w-6 h-6 ${typeInfo.className}`} />
                <div>
                  <p className="text-sm font-medium">{typeInfo.label}</p>
                  <p className="text-xs text-muted-foreground">{typeInfo.desc}</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Report;
