import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import Home from './pages/Home';
import LabView from './pages/LabView';
import AdminDashboard from './pages/AdminDashboard';
import TopicEditor from './components/Admin/TopicEditor';
import Profile from './pages/Profile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
          <Header />
          <main className="container animate-fade-in" style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lab/:id" element={<LabView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/topic/new" element={<TopicEditor />} />
              <Route path="/admin/topic/:id" element={<TopicEditor />} />
            </Routes>
          </main>
          <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            © 2026 Physics Lab Project. Rebuilt with React.
          </footer>
        </Router>
      </ThemeProvider>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
