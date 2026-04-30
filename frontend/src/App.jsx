import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import TestCaseGeneratorPage from "./pages/TestCaseGeneratorPage";
import DefectGeneratorPage from "./pages/DefectGeneratorPage";
import JiraPage from "./pages/JiraPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/test-cases" element={<TestCaseGeneratorPage />} />
        <Route path="/defects" element={<DefectGeneratorPage />} />
        <Route path="/jira" element={<JiraPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
