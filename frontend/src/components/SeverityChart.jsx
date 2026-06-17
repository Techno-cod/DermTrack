import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SeverityChart({ entries }) {
  // Reverse so oldest entry is on the left
  const data = [...entries]
    .reverse()
    .filter((e) => e.severity_score !== null)
    .map((e) => ({
      date: new Date(e.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      severity: e.severity_score,
      acne: e.acne_score,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Upload entries to see your progress chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            fontSize: "13px",
          }}
        />
        <Line
          type="monotone"
          dataKey="severity"
          stroke="#6F8E85"
          strokeWidth={2.5}
          dot={{ fill: "#6F8E85", r: 4 }}
          activeDot={{ r: 6 }}
          name="AI Severity"
        />
        <Line
          type="monotone"
          dataKey="acne"
          stroke="#C9D6C2"
          strokeWidth={2}
          dot={{ fill: "#C9D6C2", r: 3 }}
          name="Acne Score (×10)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SeverityChart;