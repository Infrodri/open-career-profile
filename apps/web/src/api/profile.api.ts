import type {
  CreateProfilePayload,
  OutputRequest,
  ProfessionalProfile,
} from '../types/profile';
import { expectNoContent, unwrap } from './http';

export async function createProfile(data: CreateProfilePayload): Promise<ProfessionalProfile> {
  const response = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return unwrap<ProfessionalProfile>(response);
}

export async function getProfile(id: string): Promise<ProfessionalProfile> {
  const response = await fetch(`/api/profiles/${id}`);
  return unwrap<ProfessionalProfile>(response);
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
  return unwrap<ProfessionalProfile>(response);
}

export async function deleteProfile(id: string): Promise<void> {
  const response = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
  return expectNoContent(response);
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

  // This endpoint streams a file, so it does not use the JSON envelope on success.
  if (!response.ok) {
    let message = 'No se pudo generar el documento';
    try {
      const json = await response.json();
      if (json?.error?.message) message = json.error.message;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  return response.blob();
}
