const res = await fetch("http://localhost:3000/api/worklogs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ date: "2026-05-20", tvShowId: "1", userId: "2", details: "test", categoryId: "2" })
});
console.log("STATUS:", res.status);
const text = await res.text();
console.log("BODY:", text.substring(0, 500));
