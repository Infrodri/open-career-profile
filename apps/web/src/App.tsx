import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CreateProfilePage } from './pages/CreateProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { ViewProfilePage } from './pages/ViewProfilePage';
import { DocumentCapturePage } from './pages/DocumentCapturePage';

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
      </Routes>
    </Layout>
  );
}
