import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, deleteProfile } from '../api/profile.api';
import { ProfileView } from '../components/ProfileView';
import { OutputGenerator } from '../components/OutputGenerator';

export function ViewProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProfile(id!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['profile', id] });
      navigate('/');
    },
  });

  if (isLoading) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  if (isError || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Profile not found or failed to load.</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <div className="flex gap-3">
          <Link
            to={`/profile/${id}/edit`}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this profile?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <ProfileView profile={profile} />
      <OutputGenerator profileId={profile.id} />
    </div>
  );
}
