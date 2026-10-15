var TOKEN_KEY = "candidate_jwt_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function loginCandidate(email, dateOfBirth) {
  var response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: email, date_of_birth: dateOfBirth }),
  });

  var data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed. Please check your credentials.");
  }

  setToken(data.token);
  return data;
}

export async function registerCandidate(name, email, dateOfBirth) {
  var response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
      date_of_birth: dateOfBirth,
    }),
  });

  var data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed.");
  }

  setToken(data.token);
  return data;
}

export async function getCurrentCandidate() {
  var token = getToken();
  if (!token) {
    return null;
  }

  var response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    removeToken();
    return null;
  }

  var data = await response.json();
  return data.candidate;
}

