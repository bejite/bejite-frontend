import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const targets = [
  'src/pages/jobseekerSignup',
  'src/pages/corporate',
  'src/pages/individual/BasicDetails.jsx',
  'src/pages/individual/ProfileSetup.jsx',
  'src/pages/individual/Location.jsx',
  'src/pages/individual/SelectId.jsx',
  'src/pages/individual/UploadDoc.jsx',
  'src/pages/individual/Verify.jsx',
  'src/pages/individual/InReview.jsx',
  'src/pages/Bio.jsx',
  'src/pages/Education.jsx',
  'src/pages/Skills.jsx',
  'src/pages/WorkHistory.jsx',
  'src/pages/Certificate.jsx',
  'src/pages/Link.jsx',
  'src/pages/JobType.jsx',
  'src/pages/Resume.jsx',
  'src/pages/JobConnection.jsx',
  'src/pages/SignUp.jsx',
  'src/pages/SignIn.jsx',
  'src/pages/SignUpRole.jsx',
  'src/pages/CompleteSignup.jsx',
  'src/pages/ConfirmPassword.jsx',
  'src/pages/EmployerOpt.jsx',
  'src/pages/jobseekerSignup/JobSeekerOpt.jsx',
  'src/components/recruiter/recruiterOnboardingUi.jsx',
  'src/components/recruiter/RecruiterFieldGroup.jsx',
  'src/components/ui/Input.jsx',
];

const replacements = [
  ['#1A3E3240', '#16730F40'],
  ['#2A5E4A', '#145a0c'],
  ['#2A4E42', '#145a0c'],
  ['#2a5949', '#145a0c'],
  ['#143026', '#145a0c'],
  ['#1A3E32', '#16730F'],
  ['text-green-900', 'text-[#16730F]'],
  ['text-green-800', 'text-[#16730F]'],
  ['text-green-700', 'text-[#16730F]'],
  ['text-green-600', 'text-[#16730F]'],
  ['text-green-500', 'text-[#16730F]'],
  ['bg-green-500', 'bg-[#16730F]'],
  ['bg-green-200', 'bg-[#16730F]/20'],
  ['bg-green-100', 'bg-[#16730F]/10'],
  ['border-green-700', 'border-[#16730F]'],
  ['text-green-300', 'text-[#16730F]/50'],
  ['bg-green-300', 'bg-[#16730F]/50'],
];

function collectFiles(entry) {
  const abs = path.join(root, entry);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return [abs];
  const out = [];
  for (const name of fs.readdirSync(abs)) {
    const child = path.join(abs, name);
    const childStat = fs.statSync(child);
    if (childStat.isDirectory()) out.push(...collectFiles(path.relative(root, child)));
    else if (/\.(jsx|js)$/.test(name)) out.push(child);
  }
  return out;
}

const files = [...new Set(targets.flatMap(collectFiles))];
let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed += 1;
    console.log(path.relative(root, file));
  }
}

console.log(`Updated ${changed} file(s).`);
