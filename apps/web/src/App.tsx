import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CreateProfilePage } from './pages/CreateProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { ViewProfilePage } from './pages/ViewProfilePage';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateProfilePage />} />
        <Route path="/profile/:id" element={<ViewProfilePage />} />
        <Route path="/profile/:id/edit" element={<EditProfilePage />} />
      </Routes>
    </Layout>
  );
}
