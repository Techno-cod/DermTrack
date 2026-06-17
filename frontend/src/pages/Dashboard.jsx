import skin1 from "../assets/skin1.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SeverityChart from "../components/SeverityChart";
import {
  getEntries,
  uploadEntry,
  deleteEntry,
  rescoreEntry,
} from "../services/api";

function Dashboard() {
  const [acneScore, setAcneScore] = useState(6);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getEntries(token);
        setEntries(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEntries();
  }, []);

  const latestEntry = entries[0];

  // Must be after entries state is declared
  const getSeverityDelta = () => {
    const scored = entries.filter((e) => e.severity_score !== null);
    if (scored.length < 2) return null;
    const latest = scored[0].severity_score;
    const previous = scored[1].severity_score;
    const delta = ((previous - latest) / previous) * 100;
    return {
      value: Math.abs(delta).toFixed(1),
      improved: delta > 0,
    };
  };

  const delta = getSeverityDelta();

  return (
    <div className="min-h-screen bg-[#F7F4EE] p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <p className="text-gray-500">Welcome back 👋</p>
            <h1 className="text-5xl font-bold text-[#1F2A44]">
              Your Skin Journey
            </h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="px-5 py-3 bg-red-500 text-white rounded-xl"
          >
            Logout
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Latest Entry — col 8 */}
          <div className="col-span-8 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Latest Skin Entry</h2>
            <div className="bg-[#F8F7F3] rounded-2xl p-5">
              <div className="flex gap-6">

                {/* Photo */}
                <div className="w-48 h-48 bg-gray-200 rounded-xl shrink-0">
                  <img
                    src={latestEntry?.cloudinary_url || skin1}
                    alt="Skin Entry"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    {latestEntry?.created_at
                      ? new Date(latestEntry.created_at).toLocaleDateString()
                      : "No entries yet"}
                  </p>

                  <p className="text-gray-600 mt-2 max-w-sm">
                    {latestEntry?.notes || "Upload your first skin entry."}
                  </p>

                  {/* Score badges */}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <div className="inline-flex px-4 py-2 rounded-full bg-[#E7EFE5] text-[#6F8E85] font-medium">
                      Acne Score: {latestEntry?.acne_score ?? "-"}/10
                    </div>

                    {latestEntry?.scoring_status === "completed" && (
                      <div className="inline-flex px-4 py-2 rounded-full bg-[#E6F1FB] text-[#0C447C] font-medium">
                        AI Severity: {latestEntry.severity_score}/100
                      </div>
                    )}

                    {latestEntry?.scoring_status === "failed" && (
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-50">
                        <span className="text-sm text-red-500">AI scoring failed</span>
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("token");
                              await rescoreEntry(latestEntry.id, token);
                              const updated = await getEntries(token);
                              setEntries(updated);
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                          className="text-sm text-[#6F8E85] underline"
                        >
                          Retry scoring
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upload form */}
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setSelectedImageFile(file);
                        setSelectedImage(URL.createObjectURL(file));
                      }}
                    />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Write today's skin notes..."
                      className="w-full mt-4 p-3 rounded-xl bg-white outline-none border border-gray-100"
                    />
                    <div className="mt-4">
                      <label className="block mb-2 font-medium">
                        Acne Score (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={acneScore}
                        onChange={(e) => setAcneScore(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white outline-none border border-gray-100"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          await uploadEntry(selectedImageFile, notes, acneScore, token);
                          const updatedEntries = await getEntries(token);
                          setEntries(updatedEntries);
                          setNotes("");
                          setAcneScore(6);
                          setSelectedImage(null);
                          setSelectedImageFile(null);
                        } catch (error) {
                          console.error(error);
                          console.log(error.response?.data);
                        }
                      }}
                      className="mt-6 px-5 py-3 bg-[#8FA58B] text-white rounded-xl hover:opacity-90"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status — col 4 */}
          <div className="col-span-4 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="grid gap-3">

              <div className="bg-[#F8F7F3] rounded-xl p-4">
                <p className="text-gray-500 text-sm">Acne Score</p>
                <h3 className="text-2xl font-bold text-[#1F2A44]">
                  {latestEntry?.acne_score ?? "-"}/10
                </h3>
              </div>

              <div className="bg-[#F8F7F3] rounded-xl p-4">
                <p className="text-gray-500 text-sm">Total Entries</p>
                <h3 className="text-2xl font-bold text-[#1F2A44]">
                  {entries.length}
                </h3>
              </div>

              {/* Severity delta — this is the new one */}
              <div className="bg-[#F8F7F3] rounded-xl p-4">
                <p className="text-gray-500 text-sm">AI Severity Trend</p>
                {delta ? (
                  <h3 className={`text-2xl font-bold ${delta.improved ? "text-green-600" : "text-red-500"}`}>
                    {delta.improved ? "↓" : "↑"} {delta.value}%
                  </h3>
                ) : (
                  <h3 className="text-2xl font-bold text-[#1F2A44]">—</h3>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {delta ? "vs last entry" : "Need 2+ scored entries"}
                </p>
              </div>

            </div>
          </div>

          {/* Progress Chart + Timeline — col 7 */}
          <div className="col-span-7 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Progress Chart</h2>
            <SeverityChart entries={entries} />

            <h2 className="text-xl font-semibold mt-6 mb-4">Timeline</h2>
            <div className="bg-[#F8F7F3] rounded-2xl p-6 space-y-4 max-h-72 overflow-y-auto">
              {entries.length === 0 && (
                <p className="text-sm text-gray-400">No entries yet.</p>
              )}
              {entries.map((entry, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-[#8FA58B] mt-1 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                    <h4 className="font-semibold">
                      Acne Score: {entry.acne_score}/10
                    </h4>
                    {entry.scoring_status === "completed" && (
                      <p className="text-sm text-[#0C447C]">
                        AI Severity: {entry.severity_score}/100
                      </p>
                    )}
                    <p className="text-gray-600 text-sm">{entry.notes}</p>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          await deleteEntry(entry.id, token);
                          const updatedEntries = await getEntries(token);
                          setEntries(updatedEntries);
                        } catch (error) {
                          console.error(error);
                        }
                      }}
                      className="mt-2 text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Routine — col 5 */}
<div className="col-span-5 bg-white rounded-3xl p-6 shadow-sm">
  <h2 className="text-xl font-semibold mb-4">Daily Routine</h2>
  <p className="text-sm text-gray-400 mb-4">
    Log your skincare routine, sleep, water, stress and mood daily.
  </p>
  <div className="flex gap-3 mt-3">
  <button
    onClick={() => navigate("/journal")}
    className="flex-1 py-3 bg-[#8FA58B] text-white rounded-xl font-medium hover:opacity-90"
  >
    Open Journal →
  </button>
  <button
    onClick={() => navigate("/insights")}
    className="flex-1 py-3 bg-[#E6F1FB] text-[#0C447C] rounded-xl font-medium hover:opacity-90"
  >
    View Insights ✨
  </button>
</div>
</div>

        </div>{/* end grid */}
      </div>{/* end max-w */}
    </div>/* end min-h-screen */
  );
}

export default Dashboard;