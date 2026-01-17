const API_BASE = import.meta.env.VITE_API_BASE;
console.log("API_BASE:", API_BASE);
export async function login(email: string, password: string): Promise<string> {
  const url = API_BASE + "/api/Auth/login";
 
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed (" + res.status + ")");

  const data = await res.json();
  return data.token as string;
}

export async function saveDrawing(token: string, title: string, commandsJson: string): Promise<number> {
  const url = API_BASE + "/api/Drawings";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ title, commandsJson }),
  });

  if (!res.ok) throw new Error("Save failed (" + res.status + ")");

  const data = await res.json();
  return data.id as number;
}

export async function loadDrawing(token: string, id: number): Promise<string> {
  const url = API_BASE + "/api/Drawings/" + id;

  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) throw new Error("Load failed (" + res.status + ")");

  const data = await res.json();
  return data.commandsJson as string;

  
}

export async function register(email: string, password: string): Promise<void> {
  const url = API_BASE + "/api/Auth/register";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Register failed (" + res.status + ")");
}           