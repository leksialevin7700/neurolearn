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

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DomainSelection />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/friends" element={<FriendsProgress />} />
          <Route path="/analytics" element={<div className="p-10 text-center">Analytics Dashboard Coming Soon</div>} />
          <Route path="/settings" element={<div className="p-10 text-center">Settings Page Coming Soon</div>} />
          <Route path="*" element={<div className="p-10 text-center">Page not found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
