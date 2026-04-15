import http from "./http";

export async function loginWithApi(email, password) {
  const { data } = await http.post("/auth/login", { email, password });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await http.post("/auth/request-password-reset", { email });
  return data;
}

export async function resetPassword(token, newPassword) {
  const { data } = await http.post("/auth/reset-password", { token, newPassword });
  return data;
}

export async function changePassword({ newPassword, currentPassword }, token) {
  const { data } = await http.post(
    "/auth/change-password",
    { newPassword, currentPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
