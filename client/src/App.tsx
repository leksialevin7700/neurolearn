import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DomainSelection } from './pages/DomainSelection';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DomainSelection />} />
          {/* We will add more routes here later (e.g. /roadmap, /quiz) */}
          <Route path="*" element={<div className="p-10 text-center">Page not found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
