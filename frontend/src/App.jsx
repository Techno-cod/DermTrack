import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import JournalPage from "./pages/JournalPage";
import InsightsPage from "./pages/InsightsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/journal" element={<JournalPage />} />
      <Route path="/insights" element={<InsightsPage />} />
    </Routes>
  );
}

export default App;