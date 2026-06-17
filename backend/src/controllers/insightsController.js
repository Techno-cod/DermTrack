const pool = require("../config/db");

// Pearson correlation between two arrays of numbers
const pearson = (x, y) => {
  const n = x.length;
  if (n < 2) return null;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((sum, xi, i) => sum + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(
    x.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
    y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  );
  return den === 0 ? null : parseFloat((num / den).toFixed(3));
};

const getInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch last 30 days of skin entries with a score
    const entriesRes = await pool.query(
      `SELECT severity_score, taken_at::date AS entry_date
       FROM skin_entries
       WHERE user_id = $1
         AND severity_score IS NOT NULL
         AND taken_at >= NOW() - INTERVAL '30 days'
       ORDER BY taken_at ASC`,
      [userId]
    );

    // Fetch last 30 days of treatment logs
    const logsRes = await pool.query(
      `SELECT log_date, sleep_hours, water_litres, stress_level, mood
       FROM treatment_logs
       WHERE user_id = $1
         AND log_date >= NOW() - INTERVAL '30 days'
       ORDER BY log_date ASC`,
      [userId]
    );

    const entries = entriesRes.rows;
    const logs = logsRes.rows;

    const insights = [];

    // ── Insight 1: Overall severity trend ──────────────────────────
    if (entries.length >= 2) {
      const first = entries[0].severity_score;
      const last  = entries[entries.length - 1].severity_score;
      const delta = ((first - last) / first) * 100;
      const days  = entries.length;

      if (Math.abs(delta) >= 5) {
        insights.push({
          type: "severity_trend",
          icon: delta > 0 ? "📉" : "📈",
          title: delta > 0 ? "Skin improving" : "Skin worsening",
          narrative: delta > 0
            ? `Your AI severity score improved by ${Math.abs(delta).toFixed(1)}% over your last ${days} tracked entries. Keep going.`
            : `Your AI severity score increased by ${Math.abs(delta).toFixed(1)}% over your last ${days} tracked entries. Consider reviewing your routine.`,
          positive: delta > 0,
        });
      } else {
        insights.push({
          type: "severity_trend",
          icon: "➡️",
          title: "Skin holding steady",
          narrative: `Your severity score has remained stable (±5%) across your last ${days} entries.`,
          positive: true,
        });
      }
    }

    // ── Correlations require matching dates ────────────────────────
    // Join entries and logs on date
    const entryMap = {};
    entries.forEach((e) => {
      entryMap[e.entry_date] = e.severity_score;
    });

    const matched = logs
      .filter((l) => entryMap[l.log_date] !== undefined)
      .map((l) => ({
        severity:    entryMap[l.log_date],
        sleep:       parseFloat(l.sleep_hours),
        water:       parseFloat(l.water_litres),
        stress:      parseInt(l.stress_level),
        mood:        parseInt(l.mood),
      }))
      .filter((m) =>
        !isNaN(m.severity) &&
        !isNaN(m.sleep) &&
        !isNaN(m.water) &&
        !isNaN(m.stress) &&
        !isNaN(m.mood)
      );

    if (matched.length >= 3) {
      const severities = matched.map((m) => m.severity);
      const sleeps     = matched.map((m) => m.sleep);
      const waters     = matched.map((m) => m.water);
      const stresses   = matched.map((m) => m.stress);
      const moods      = matched.map((m) => m.mood);

      // ── Insight 2: Sleep correlation ──────────────────────────────
      const rSleep = pearson(sleeps, severities);
      if (rSleep !== null && Math.abs(rSleep) >= 0.3) {
        const avgSleep = (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1);
        insights.push({
          type: "sleep_correlation",
          icon: "😴",
          title: rSleep < 0 ? "Sleep is helping your skin" : "Poor sleep affecting skin",
          narrative: rSleep < 0
            ? `Nights with more sleep correlated with lower severity scores (r=${rSleep}). Your average sleep is ${avgSleep}h — keep it above 7h.`
            : `Less sleep appears to coincide with higher severity scores (r=${rSleep}). Your average is ${avgSleep}h — try for 7–8h.`,
          positive: rSleep < 0,
        });
      }

      // ── Insight 3: Water correlation ──────────────────────────────
      const rWater = pearson(waters, severities);
      if (rWater !== null && Math.abs(rWater) >= 0.3) {
        const avgWater = (waters.reduce((a, b) => a + b, 0) / waters.length).toFixed(1);
        insights.push({
          type: "water_correlation",
          icon: "💧",
          title: rWater < 0 ? "Hydration is helping" : "Low hydration coincides with flares",
          narrative: rWater < 0
            ? `Higher water intake correlated with lower severity (r=${rWater}). You averaged ${avgWater}L — aim for 2–3L daily.`
            : `Lower water intake appears to coincide with worse skin (r=${rWater}). You averaged ${avgWater}L — try increasing to 2L+.`,
          positive: rWater < 0,
        });
      }

      // ── Insight 4: Stress correlation ─────────────────────────────
      const rStress = pearson(stresses, severities);
      if (rStress !== null && Math.abs(rStress) >= 0.3) {
        insights.push({
          type: "stress_correlation",
          icon: "😤",
          title: rStress > 0 ? "Stress linked to flares" : "Stress not affecting severity",
          narrative: rStress > 0
            ? `Higher stress levels coincided with higher severity scores (r=${rStress}). Stress management may help your skin.`
            : `Interestingly, stress doesn't appear strongly linked to your severity scores in this period (r=${rStress}).`,
          positive: rStress <= 0,
        });
      }

      // ── Insight 5: Mood correlation ───────────────────────────────
      const rMood = pearson(moods, severities);
      if (rMood !== null && Math.abs(rMood) >= 0.3) {
        insights.push({
          type: "mood_correlation",
          icon: "💆",
          title: rMood < 0 ? "Better mood, better skin" : "Mood and severity tracking together",
          narrative: rMood < 0
            ? `Better mood days correlated with lower severity scores (r=${rMood}). Mind-skin connection appears real for you.`
            : `Lower mood appeared alongside higher severity (r=${rMood}). This could be bidirectional — skin affects mood too.`,
          positive: rMood < 0,
        });
      }
    }

    // ── Insight 6: Data volume nudge ──────────────────────────────
    if (entries.length < 3) {
      insights.push({
        type: "nudge",
        icon: "📸",
        title: "More data needed",
        narrative: `You have ${entries.length} scored ${entries.length === 1 ? "entry" : "entries"} in the last 30 days. Upload at least 3 photos to start seeing correlations.`,
        positive: null,
      });
    }

    if (logs.length < 3) {
      insights.push({
        type: "nudge",
        icon: "📝",
        title: "Log your daily routine",
        narrative: `You have ${logs.length} journal ${logs.length === 1 ? "entry" : "entries"} in the last 30 days. Log sleep, water and stress daily to unlock correlation insights.`,
        positive: null,
      });
    }

    return res.json({
      insights,
      meta: {
        entries_analyzed: entries.length,
        logs_analyzed: logs.length,
        matched_days: matched.length,
      },
    });
  } catch (error) {
    console.error("Insights failed:", error.message);
    return res.status(500).json({ message: "Failed to generate insights" });
  }
};

module.exports = { getInsights };