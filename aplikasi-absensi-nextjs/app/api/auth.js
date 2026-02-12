const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginRequest(nip, password, remember = false) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nip, password, remember }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  });
  return res.json();
}

export async function logoutRequest() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}
