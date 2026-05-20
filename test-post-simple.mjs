async function test() {
  // 1. Login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "admin1234" })
  });
  console.log("LOGIN:", loginRes.status);
  const cookieStr = loginRes.headers.get("set-cookie") || "";
  const sessionToken = cookieStr.match(/session_token=[^;]+/)?.[0] || "";
  if (!sessionToken) { console.log("No session"); return; }

  // 2. POST without categoryId
  const postRes = await fetch("http://localhost:3000/api/worklogs", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": sessionToken },
    body: JSON.stringify({ date: "2026-05-20", tvShowId: "1", userId: "1", details: "test no category" })
  });
  console.log("POST (no cat):", postRes.status);
  const text = await postRes.text();
  console.log("BODY:", text.substring(0, 300));
}
test().catch(e => console.error("ERR:", e));
setTimeout(() => process.exit(0), 4000);
