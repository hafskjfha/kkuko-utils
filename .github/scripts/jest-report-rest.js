const fs = require("fs");
const path = require("path");
const https = require("https");

const results = JSON.parse(fs.readFileSync("jest-results.json", "utf8"));
const passIcon = "✅";
const failIcon = "❌";

const testResults = results.testResults
  .map(file => {
    const fileName = file.name.split(process.cwd() + path.sep).pop();
    const icon = file.status === "passed" ? passIcon : failIcon;
    return `- ${icon} \`${fileName}\``;
  })
  .join("\n");

const body = `
## 🧪 Jest Test Report

${testResults}
`;

const data = JSON.stringify({ body });
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const prNumber = process.env.PR_NUMBER;

const options = {
  hostname: "api.github.com",
  path: `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
  method: "POST",
  headers: {
    "User-Agent": "jest-comment-bot",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = https.request(options, res => {
  console.log(`GitHub API status: ${res.statusCode}`);
  res.on("data", d => process.stdout.write(d));
});

req.on("error", error => {
  console.error(error);
});

req.write(data);
req.end();
