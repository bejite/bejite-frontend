import fs from 'fs';

const data = JSON.parse(fs.readFileSync('lint-report.json', 'utf8'));
for (const f of data.filter((x) => x.errorCount)) {
  const rules = [...new Set(f.messages.map((m) => m.ruleId))];
  const path = f.filePath.replace(/.*Admin-frontend[\\/]/, '');
  console.log(`${f.errorCount}\t${rules.join(',')}\t${path}`);
}
