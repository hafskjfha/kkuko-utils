const fs = require('fs');

const data = JSON.parse(fs.readFileSync('jest-results.json', 'utf-8'));
const { numTotalTests, numPassedTests, numFailedTests, testResults } = data;

let summary = `## ✅ Jest Test Summary\n`;
summary += `- Total: **${numTotalTests}**\n`;
summary += `- Passed: ✅ ${numPassedTests}\n`;
summary += `- Failed: ❌ ${numFailedTests}\n\n`;

if (numFailedTests > 0) {
  summary += `### ❌ Failed Tests\n`;
  testResults.forEach(file => {
    file.assertionResults
      .filter(test => test.status === 'failed')
      .forEach(test => {
        summary += `- ${test.fullName} (${file.name})\n`;
      });
  });
}

fs.writeFileSync('summary.md', summary);
