import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CreateProfilePage } from './pages/CreateProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { ViewProfilePage } from './pages/ViewProfilePage';
import { DocumentCapturePage } from './pages/DocumentCapturePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { GeneratePage } from './pages/GeneratePage';
import { TemplatesPage } from './pages/TemplatesPage';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateProfilePage />} />
        <Route path="/perfil" element={<ViewProfilePage />} />
        <Route path="/profile/:id" element={<ViewProfilePage />} />
        <Route path="/profile/:id/edit" element={<EditProfilePage />} />
        <Route path="/documento" element={<DocumentCapturePage />} />
        <Route path="/documentos" element={<DocumentsPage />} />
        <Route path="/plantillas" element={<TemplatesPage />} />
        <Route path="/generar" element={<GeneratePage />} />
        {/* Anything else goes home instead of rendering a blank page. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
