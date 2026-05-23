// app/lib/auth.js
export async function loginUser(username, password) {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const res = await fetch('http://localhost:8000/login', {   // ← Change en prod
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.detail || 'Erreur de connexion');

  localStorage.setItem('token', data.access_token);
  return data;
}

export async function registerUser(username, email, password) {
  const res = await fetch('http://localhost:8000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Erreur inscription');
  return data;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}