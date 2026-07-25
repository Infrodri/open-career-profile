import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Open Career Profile</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Build and maintain your professional profile locally and privately. Create your CV, manage
        your career data, and generate polished documents.
      </p>
      <Link
        to="/create"
        className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Create Your Profile
      </Link>
    </div>
  );
}
