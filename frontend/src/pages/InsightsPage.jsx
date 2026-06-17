import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getInsights } from "../services/api";

function InsightsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const fetch = async () => {
      try {
        const result = await getInsights(token);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7F4EE] p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-gray-500">What your data says about you</p>
            <h1 className="text-4xl font-bold text-[#1F2A44]">AI Insights</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              className="px-5 py-2 bg-red-500 text-white rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Meta bar */}
        {data?.meta && (
          <div className="flex gap-4 mb-6">
            {[
              { label: "Photos analyzed", value: data.meta.entries_analyzed },
              { label: "Journal logs", value: data.meta.logs_analyzed },
              { label: "Matched days", value: data.meta.matched_days },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl px-5 py-3 shadow-sm flex-1 text-center">
                <p className="text-2xl font-bold text-[#1F2A44]">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Analyzing your data...</div>
        ) : (
          <div className="space-y-4">
            {data?.insights?.length === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center text-gray-400">
                No insights yet — upload photos and log your routine for a few days first.
              </div>
            )}
            {data?.insights?.map((insight, i) => (
              <div
                key={i}
                className={`bg-white rounded-3xl p-6 shadow-sm border-l-4 ${
                  insight.positive === true
                    ? "border-[#8FA58B]"
                    : insight.positive === false
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{insight.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[#1F2A44] text-lg mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {insight.narrative}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explanation */}
        <div className="mt-8 bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#1F2A44] mb-2">How insights are generated</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Insights use Pearson correlation to find statistical relationships between your daily habits
            (sleep, water, stress, mood) and your AI severity scores. A correlation above ±0.3 is
            considered meaningful. No AI language model is used — these are direct patterns from your
            own data. The more consistently you log, the more accurate the insights become.
          </p>
        </div>

      </div>
    </div>
  );
}

export default InsightsPage;