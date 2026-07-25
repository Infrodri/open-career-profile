import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createProfile } from '../api/profile.api';
import { ProfileForm } from '../components/ProfileForm';
import type { CreateProfilePayload } from '../types/profile';

export function CreateProfilePage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: CreateProfilePayload) => createProfile(data),
    onSuccess: (profile) => {
      navigate(`/profile/${profile.id}`);
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Profile</h1>
      {mutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {mutation.error.message}
        </div>
      )}
      <ProfileForm
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={mutation.isPending}
        submitLabel="Create Profile"
      />
    </div>
  );
}
