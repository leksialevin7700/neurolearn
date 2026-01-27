import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DomainSelection } from './pages/DomainSelection';
import { Chat } from './pages/Chat';
import { CalendarView } from './pages/Calendar';
import './App.css';

// Placeholder for Friends Progress
const FriendsProgress = () => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
    <div className="text-6xl">👥</div>
    <h2 className="text-2xl font-bold text-slate-800">Friends Progress</h2>
    <p className="text-slate-500">Connect with your friends to see their learning journey!</p>
    <div className="p-4 bg-indigo-50 text-indigo-700 rounded-xl">
       Coming soon in the hackathon demo!
    </div>
  </div>
);

import { ThemeProvider } from "@/components/theme-provider"

import { DiagnosticQuiz } from './pages/DiagnosticQuiz';
import { RoadmapView } from './pages/RoadmapView';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Standalone Route for Focus Mode */}
          <Route path="/quiz/diagnostic/:domainId" element={<DiagnosticQuiz />} />

          {/* Layout Routes (Sidebar Visible) */}
          <Route path="/" element={<Layout><DomainSelection /></Layout>} />
          <Route path="/roadmap/:domainId" element={<Layout><RoadmapView /></Layout>} />
          <Route path="/chat" element={<Layout><Chat /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarView /></Layout>} />
          <Route path="/friends" element={<Layout><FriendsProgress /></Layout>} />
          <Route path="/analytics" element={<Layout><div className="p-10 text-center dark:text-white">Analytics Dashboard Coming Soon</div></Layout>} />
          <Route path="/settings" element={<Layout><div className="p-10 text-center dark:text-white">Settings Page Coming Soon</div></Layout>} />
          <Route path="*" element={<Layout><div className="p-10 text-center dark:text-white">Page not found</div></Layout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
