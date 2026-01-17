// =======================
// AI – Interpret Prompt
// =======================

export type InterpretResponse = {
  commandsJson: string;
};

export async function interpretPrompt(prompt: string): Promise<InterpretResponse> {
  const res = await fetch("/api/ai/interpret", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as any;

  if (!data || typeof data.commandsJson !== "string") {
    console.log("Bad interpret response:", data);
    throw new Error("Bad response from server (missing commandsJson)");
  }

  // בדיקה שזה JSON תקין
  try {
    JSON.parse(data.commandsJson);
  } catch {
    throw new Error("commandsJson is not valid JSON");
  }

  return { commandsJson: data.commandsJson };
}

// =======================
// Drawings – Save / Load / List
// =======================

export type SaveDrawingRequest = {
  title: string;
  commandsJson: string;
};

export async function saveDrawing(req: SaveDrawingRequest): Promise<{ id: number }> {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/drawings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as any;

  if (!data || typeof data.id !== "number") {
    console.log("Bad save response:", data);
    throw new Error("Bad response from server (missing id)");
  }

  return { id: data.id };
}

export async function loadDrawing(
  id: number
): Promise<{ id: number; title: string; commandsJson: string; createdAt: string }> {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api/drawings/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as any;

  if (!data || typeof data.commandsJson !== "string") {
    console.log("Bad load response:", data);
    throw new Error("Bad response from server (missing commandsJson)");
  }

  return {
    id: Number(data.id),
    title: String(data.title ?? ""),
    commandsJson: String(data.commandsJson),
    createdAt: String(data.createdAt ?? ""),
  };
}

export async function listMyDrawings(): Promise<
  { id: number; title: string; createdAt: string }[]
> {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/drawings", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as any;

  if (!Array.isArray(data)) {
    console.log("Bad list response:", data);
    throw new Error("Bad response from server (expected array)");
  }

  return data.map((x: any) => ({
    id: Number(x.id),
    title: String(x.title ?? ""),
    createdAt: String(x.createdAt ?? ""),
  }));
}

// =======================
// Auth – Register / Login / Me
// =======================

export async function register(email: string, password: string): Promise<{ token: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as { token: string };
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as { token: string };
}

export async function me(): Promise<{ id: string; email: string }> {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as { id: string; email: string };
}