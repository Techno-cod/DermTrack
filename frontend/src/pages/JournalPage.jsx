import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveJournalLog, getJournalLogs, getTodayLog } from "../services/api";

function JournalPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    sleep_hours: "",
    water_litres: "",
    stress_level: "",
    mood: "",
    face_wash: "",
    medicines: "",
    custom_notes: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Pre-fill with today's log if it exists
    const fetchData = async () => {
      try {
        const [today, allLogs] = await Promise.all([
          getTodayLog(token),
          getJournalLogs(token),
        ]);
        if (today) {
          setForm({
            sleep_hours:  today.sleep_hours  ?? "",
            water_litres: today.water_litres ?? "",
            stress_level: today.stress_level ?? "",
            mood:         today.mood         ?? "",
            face_wash:    today.face_wash    ?? "",
            medicines:    today.medicines    ?? "",
            custom_notes: today.custom_notes ?? "",
          });
        }
        setLogs(allLogs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await saveJournalLog(form, token);
      const allLogs = await getJournalLogs(token);
      setLogs(allLogs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const moodLabel = (val) => {
    const labels = { 1: "😞 Very Bad", 2: "😕 Bad", 3: "😐 Okay", 4: "🙂 Good", 5: "😄 Great" };
    return labels[val] || "—";
  };

  const stressLabel = (val) => {
    const labels = { 1: "😌 Very Low", 2: "🟢 Low", 3: "🟡 Medium", 4: "🔴 High", 5: "🆘 Very High" };
    return labels[val] || "—";
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-gray-500">Track your daily habits</p>
            <h1 className="text-4xl font-bold text-[#1F2A44]">Treatment Journal</h1>
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

        <div className="grid grid-cols-12 gap-6">

          {/* Today's Log Form */}
          <div className="col-span-7 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
              Today's Log
              <span className="ml-3 text-sm font-normal text-gray-400">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </h2>

            <div className="space-y-5">

              {/* Sleep + Water */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    😴 Sleep Hours
                  </label>
                  <input
                    type="number"
                    name="sleep_hours"
                    min="0" max="24" step="0.5"
                    value={form.sleep_hours}
                    onChange={handleChange}
                    placeholder="e.g. 7.5"
                    className="w-full p-3 rounded-xl bg-[#F8F7F3] outline-none border border-transparent focus:border-[#8FA58B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    💧 Water (litres)
                  </label>
                  <input
                    type="number"
                    name="water_litres"
                    min="0" max="10" step="0.1"
                    value={form.water_litres}
                    onChange={handleChange}
                    placeholder="e.g. 2.5"
                    className="w-full p-3 rounded-xl bg-[#F8F7F3] outline-none border border-transparent focus:border-[#8FA58B]"
                  />
                </div>
              </div>

              {/* Stress */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  😤 Stress Level — {stressLabel(form.stress_level)}
                </label>
                <input
                  type="range"
                  name="stress_level"
                  min="1" max="5" step="1"
                  value={form.stress_level || 3}
                  onChange={handleChange}
                  className="w-full accent-[#8FA58B]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Very Low</span><span>Low</span><span>Medium</span><span>High</span><span>Very High</span>
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  💆 Mood — {moodLabel(form.mood)}
                </label>
                <input
                  type="range"
                  name="mood"
                  min="1" max="5" step="1"
                  value={form.mood || 3}
                  onChange={handleChange}
                  className="w-full accent-[#8FA58B]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Very Bad</span><span>Bad</span><span>Okay</span><span>Good</span><span>Great</span>
                </div>
              </div>

              {/* Face wash + Medicines */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    🧴 Face Wash Used
                  </label>
                  <input
                    type="text"
                    name="face_wash"
                    value={form.face_wash}
                    onChange={handleChange}
                    placeholder="e.g. CeraVe"
                    className="w-full p-3 rounded-xl bg-[#F8F7F3] outline-none border border-transparent focus:border-[#8FA58B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    💊 Medicines
                  </label>
                  <input
                    type="text"
                    name="medicines"
                    value={form.medicines}
                    onChange={handleChange}
                    placeholder="e.g. Adapalene"
                    className="w-full p-3 rounded-xl bg-[#F8F7F3] outline-none border border-transparent focus:border-[#8FA58B]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  📝 Notes
                </label>
                <textarea
                  name="custom_notes"
                  value={form.custom_notes}
                  onChange={handleChange}
                  placeholder="Anything else you noticed today..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#F8F7F3] outline-none border border-transparent focus:border-[#8FA58B] resize-none"
                />
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-[#8FA58B] text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Today's Log"}
              </button>

            </div>
          </div>

          {/* Log History */}
          <div className="col-span-5 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">History</h2>

            {logs.length === 0 ? (
              <p className="text-sm text-gray-400">No logs yet. Save today's first!</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="bg-[#F8F7F3] rounded-2xl p-4">
                    <p className="text-sm font-semibold text-[#1F2A44] mb-2">
                      {new Date(log.log_date).toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short"
                      })}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                      {log.sleep_hours  && <span>😴 {log.sleep_hours}h sleep</span>}
                      {log.water_litres && <span>💧 {log.water_litres}L water</span>}
                      {log.stress_level && <span>😤 Stress: {log.stress_level}/5</span>}
                      {log.mood         && <span>💆 Mood: {log.mood}/5</span>}
                      {log.face_wash    && <span>🧴 {log.face_wash}</span>}
                      {log.medicines    && <span>💊 {log.medicines}</span>}
                    </div>
                    {log.custom_notes && (
                      <p className="text-xs text-gray-400 mt-2 italic">{log.custom_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default JournalPage;