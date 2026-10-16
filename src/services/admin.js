var ADMIN_PASSCODE_KEY = "online_test_admin_passcode";

export function getStoredAdminPasscode() {
  return sessionStorage.getItem(ADMIN_PASSCODE_KEY) || "";
}

export function setStoredAdminPasscode(passcode) {
  if (passcode) {
    sessionStorage.setItem(ADMIN_PASSCODE_KEY, passcode);
  } else {
    sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
  }
}

export function clearStoredAdminPasscode() {
  sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
}

function getAdminHeaders(passcode) {
  var code = passcode || getStoredAdminPasscode();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Admin-Passcode": code,
  };
}

export async function fetchAdminStats(passcode) {
  var res = await fetch("/api/admin/stats", {
    method: "GET",
    headers: getAdminHeaders(passcode),
  });

  var data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch admin stats.");
  }
  return data;
}

export async function fetchAdminSubmissions(passcode) {
  var res = await fetch("/api/admin/submissions", {
    method: "GET",
    headers: getAdminHeaders(passcode),
  });

  var data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch submissions.");
  }
  return data.submissions || [];
}

export async function fetchAdminCandidates(passcode) {
  var res = await fetch("/api/admin/candidates", {
    method: "GET",
    headers: getAdminHeaders(passcode),
  });

  var data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch candidates.");
  }
  return data.candidates || [];
}

export async function resetCandidateAttempt(candidateId, passcode) {
  var res = await fetch(`/api/admin/reset_attempt/${candidateId}`, {
    method: "POST",
    headers: getAdminHeaders(passcode),
  });

  var data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to reset candidate attempt.");
  }
  return data;
}

export async function deleteAdminSubmission(submissionId, passcode) {
  var res = await fetch(`/api/admin/submissions/${submissionId}`, {
    method: "DELETE",
    headers: getAdminHeaders(passcode),
  });

  var data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete submission.");
  }
  return data;
}

export async function deleteAdminCandidate(candidateId, passcode) {
  var res = await fetch(`/api/admin/candidates/${candidateId}`, {
    method: "DELETE",
    headers: getAdminHeaders(passcode),
  });

  var data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete candidate.");
  }
  return data;
}

export async function clearAllPlatformData(passcode) {
  var res = await fetch("/api/admin/clear_all", {
    method: "POST",
    headers: getAdminHeaders(passcode),
  });

  var data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to clear platform data.");
  }
  return data;
}

