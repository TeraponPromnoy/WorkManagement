async function test() {
  // 1. Login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "admin1234" })
  });
  console.log("LOGIN STATUS:", loginRes.status);
  const cookies = loginRes.headers.getSetCookie?.() || loginRes.headers.get("set-cookie") || "";
  console.log("COOKIES:", cookies);

  // Extract session_token
  const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
  const sessionToken = cookieStr.match(/session_token=[^;]+/)?.[0] || "";
  console.log("SESSION:", sessionToken);

  if (!sessionToken) {
    console.log("No session token, cannot test POST");
    return;
  }

  // 2. POST worklog with cookie
  const postRes = await fetch("http://localhost:3000/api/worklogs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": sessionToken
    },
    body: JSON.stringify({ date: "2026-05-20", tvShowId: "1", userId: "1", details: "test post", categoryId: "1" })
  });
  console.log("POST STATUS:", postRes.status);
  const text = await postRes.text();
  console.log("POST BODY:", text.substring(0, 800));
}

test().catch(e => console.error("ERROR:", e));
setTimeout(() => process.exit(0), 5000);
