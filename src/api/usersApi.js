import http from "./http";

export async function emailExists(email) {
  const encoded = encodeURIComponent(String(email || "").trim().toLowerCase());
  const { data } = await http.get(`/users/exists/email/${encoded}`);
  return Boolean(data?.exists);
}

export async function documentExists(numDocumento) {
  const encoded = encodeURIComponent(String(numDocumento || "").trim());
  const { data } = await http.get(`/users/exists/document/${encoded}`);
  return Boolean(data?.exists);
}

export async function getUserById(id) {
  const { data } = await http.get(`/users/${id}`);
  return data;
}

export async function getAllUsers() {
  const { data } = await http.get("/users");
  return Array.isArray(data) ? data : [];
}

export async function getDelegatedProfessionals() {
  const { data } = await http.get("/users/profesionales-delegados");
  return Array.isArray(data) ? data : [];
}

export async function createUser(payload) {
  const { data } = await http.post("/users", payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await http.put(`/users/${id}`, payload);
  return data;
}

export async function deleteUserById(id) {
  const { data } = await http.delete(`/users/${id}`);
  return data;
}

export async function updateUserPasswordById(id, password, mustChangePassword) {
  const { data } = await http.patch(`/users/${id}/password`, {
    password,
    mustChangePassword,
  });
  return data;
}

export async function unlockUserById(id) {
  const { data } = await http.patch(`/users/${id}/unlock`);
  return data;
}
