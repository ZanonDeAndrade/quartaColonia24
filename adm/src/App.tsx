import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { ToastProvider } from './components/ui/toast';
import { AuthProvider } from './context/AuthContext';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminColumnsFormPage } from './pages/AdminColumnsFormPage';
import { AdminColumnsListPage } from './pages/AdminColumnsListPage';
import { AdminNewsFormPage } from './pages/AdminNewsFormPage';
import { AdminNewsListPage } from './pages/AdminNewsListPage';
import { AdminSponsorsPage } from './pages/AdminSponsorsPage';
import { ThemePreview } from './pages/ThemePreview';
import './pages/admin.css';

const App = () => {
  const isDev = import.meta.env.DEV;

  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Navigate replace to="/news" />} path="/" />
            <Route element={<AdminLoginPage />} path="/login" />

            <Route element={<AdminRoute />}>
              <Route element={<AdminNewsListPage />} path="/news" />
              <Route element={<AdminNewsFormPage />} path="/news/new" />
              <Route element={<AdminNewsFormPage />} path="/news/:id" />
              <Route element={<AdminColumnsListPage />} path="/columns" />
              <Route element={<AdminColumnsFormPage />} path="/columns/new" />
              <Route element={<AdminColumnsFormPage />} path="/columns/:id" />
              <Route element={<AdminSponsorsPage />} path="/sponsors" />
            </Route>

            {isDev ? <Route element={<ThemePreview />} path="/theme-preview" /> : null}

            <Route element={<Navigate replace to="/news" />} path="*" />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
