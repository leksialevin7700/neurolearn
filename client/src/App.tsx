import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DomainSelection } from './pages/DomainSelection';
import { Chat } from './pages/Chat';
import { CalendarView } from './pages/Calendar';
import './App.css';

import { ThemeProvider } from "@/components/theme-provider"
import { DiagnosticQuiz } from './pages/DiagnosticQuiz';
import { RoadmapView } from './pages/RoadmapView';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ModuleLearning } from './pages/ModuleLearning';
import { FriendsProgress } from './pages/FriendsProgress';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Standalone Route for Focus Mode */}
          <Route path="/quiz/diagnostic/:domainId" element={<DiagnosticQuiz />} />

          {/* Layout Routes (Sidebar Visible) */}
          <Route path="/" element={<Layout><DomainSelection /></Layout>} />
          <Route path="/roadmap/:domainId" element={<Layout><RoadmapView /></Layout>} />
          <Route path="/learn/:domainId/:moduleId" element={<Layout><ModuleLearning /></Layout>} />
          <Route path="/chat" element={<Layout><Chat /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarView /></Layout>} />
          <Route path="/friends" element={<Layout><FriendsProgress /></Layout>} />
          <Route path="/analytics/:domainId" element={<Layout><AnalyticsDashboard /></Layout>} />

          {/* Default Analytics (for sidebar link) */}
          <Route path="/analytics" element={<Layout><div className="p-10 text-center dark:text-white">Please select a course to view analytics.</div></Layout>} />

          <Route path="/settings" element={<Layout><div className="p-10 text-center dark:text-white">Settings Page Coming Soon</div></Layout>} />
          <Route path="*" element={<Layout><div className="p-10 text-center dark:text-white">Page not found</div></Layout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
