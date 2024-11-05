import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ContextForm } from './components/ContextForm';
import { TierKeywords } from './components/keyword/TierKeywords';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { SettingsPage } from './components/settings/SettingsPage';
import { authService } from './services/authService';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route path="/" element={<ContextForm />} />
          <Route path="/keywords/tier-1" element={<TierKeywords />} />
          <Route path="/keywords/tier-2" element={<TierKeywords />} />
          <Route path="/keywords/tier-3" element={<TierKeywords />} />
          <Route path="/keywords/tier-4" element={<TierKeywords />} />
          <Route path="/keywords/tier-5" element={<TierKeywords />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}