import type {
  ApiResponse,
  CreateProfilePayload,
  OutputRequest,
  ProfessionalProfile,
} from '../types/profile';

async function handleResponse<T>(response: Response): Promise<T> {
  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    const errorMessage = !json.success ? json.error.message : 'Request failed';
    throw new Error(errorMessage);
  }

  return json.data;
}

export async function createProfile(data: CreateProfilePayload): Promise<ProfessionalProfile> {
  const response = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ProfessionalProfile>(response);
}

export async function getProfile(id: string): Promise<ProfessionalProfile> {
  const response = await fetch(`/api/profiles/${id}`);
  return handleResponse<ProfessionalProfile>(response);
}

export async function updateProfile(
  id: string,
  data: CreateProfilePayload,
): Promise<ProfessionalProfile> {
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ProfessionalProfile>(response);
}

export async function deleteProfile(id: string): Promise<void> {
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete profile');
  }
}

export async function generateOutput(
  id: string,
  templateId: string,
  format: OutputRequest['format'],
): Promise<Blob> {
  const response = await fetch(`/api/profiles/${id}/output`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId, format }),
  });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Failed to generate output';
    try {
      const json = JSON.parse(text);
      if (json.error?.message) {
        message = json.error.message;
      }
    } catch {
      // use default message
    }
    throw new Error(message);
  }

  return response.blob();
}
