import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../api/profile.api';
import { ProfileForm } from '../components/ProfileForm';
import type { CreateProfilePayload } from '../types/profile';

export function EditProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProfilePayload) => updateProfile(id!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile', id], updated);
      navigate(`/profile/${id}`);
    },
  });

  if (isLoading) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  if (isError || !profile) {
    return <p className="text-red-600">Failed to load profile.</p>;
  }

  const initialData: CreateProfilePayload = {
    personalInfo: profile.personalInfo,
    sections: {
      workExperience: profile.sections.workExperience.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest),
      education: profile.sections.education.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest),
      skills: profile.sections.skills.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest),
      certifications: profile.sections.certifications.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest),
      languages: profile.sections.languages.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest),
      courses: profile.sections.courses,
      projects: profile.sections.projects,
      publications: profile.sections.publications,
      awards: profile.sections.awards,
      affiliations: profile.sections.affiliations,
      volunteering: profile.sections.volunteering,
      references: profile.sections.references,
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h1>
      {mutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {mutation.error.message}
        </div>
      )}
      <ProfileForm
        initialData={initialData}
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={mutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
