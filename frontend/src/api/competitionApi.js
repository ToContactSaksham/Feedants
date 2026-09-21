import client from './client';

export async function fetchCompetition(idOrSlug) {
  const { data } = await client.get(`/competitions/${idOrSlug}`);
  return data.data;
}

export async function registerForCompetition(idOrSlug, referralCode) {
  const { data } = await client.post(`/competitions/${idOrSlug}/register`, referralCode ? { referralCode } : {});
  return data.data;
}

export async function cancelRegistration(idOrSlug) {
  const { data } = await client.delete(`/competitions/${idOrSlug}/register`);
  return data.data;
}

export async function uploadSubmission(idOrSlug, file) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'submission.mp4',
    type: file.mimeType || 'video/mp4',
  });

  const { data } = await client.post(`/competitions/${idOrSlug}/submissions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}

export async function register(name, email, password) {
  const { data } = await client.post('/auth/register', { name, email, password });
  return data.data;
}
