// Carga masiva de usuarios
export async function bulkCreateUsers(usersArray) {
  const { data } = await http.post("/users/bulk", { users: usersArray });
  return data;
}
import http from "./http";

const USERS_CACHE_TTL_MS = 60 * 1000;
let usersCacheData = null;
let usersCacheExpiresAt = 0;
let usersCachePending = null;

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

export async function getAllUsers(options = {}) {
  const forceRefresh = Boolean(options?.forceRefresh);
  const now = Date.now();

  if (!forceRefresh && usersCacheData && usersCacheExpiresAt > now) {
    return usersCacheData;
  }

  if (!forceRefresh && usersCachePending) {
    return usersCachePending;
  }

  usersCachePending = http.get("/users")
    .then(({ data }) => {
      const users = Array.isArray(data) ? data : [];
      usersCacheData = users;
      usersCacheExpiresAt = Date.now() + USERS_CACHE_TTL_MS;
      return users;
    })
    .finally(() => {
      usersCachePending = null;
    });

  return usersCachePending;
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
