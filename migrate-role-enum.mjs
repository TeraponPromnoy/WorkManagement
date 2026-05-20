import { exec } from "child_process";

console.log("Using prisma db push with --accept-data-loss to update schema...");

exec("npx prisma db push --accept-data-loss", (error, stdout, stderr) => {
  if (error) {
    console.error("Migration error:", error);
    return;
  }
  if (stderr) {
    console.error("stderr:", stderr);
    return;
  }
  console.log(stdout);
  console.log("Schema updated successfully!");
});
