import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import Layout from './components/Layout';
import Home from './components/Home';
import Profile from './components/Profile';
import TicTacToe from './components/games/TicTacToe';
import Memory from './components/games/Memory';
import RPS from './components/games/RPS';
import NumberGuess from './components/games/NumberGuess';

function AppContent() {
  const { profile, loading } = useAuth();
  const [view, setView] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎮</div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) return <AuthScreen />;

  const renderView = () => {
    switch (view) {
      case 'home': return <Home onNavigate={setView} />;
      case 'profile': return <Profile />;
      case 'tictactoe': return <TicTacToe onBack={() => setView('home')} />;
      case 'memory': return <Memory onBack={() => setView('home')} />;
      case 'rps': return <RPS onBack={() => setView('home')} />;
      case 'numberguess': return <NumberGuess onBack={() => setView('home')} />;
      default: return <Home onNavigate={setView} />;
    }
  };

  return (
    <Layout currentView={view} onNavigate={setView}>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div id="app-bg" className="fixed inset-0 -z-10 bg-aurora" />
      <AppContent />
    </AuthProvider>
  );
}
