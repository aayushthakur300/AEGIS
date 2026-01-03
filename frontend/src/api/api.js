export async function sendCrash(log) {
  await fetch("http://localhost:5000/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logs: log })
  });
}

export async function analyze(log) {
  const res = await fetch("http://localhost:5000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ errorLog: log })
  });
  return res.json();
}

export async function analytics() {
  return fetch("http://localhost:5000/api/analytics").then(r => r.json());
}
