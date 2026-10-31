import fs from 'fs';
import path from 'path';

const callingDeskPath = path.resolve('frontend/src/components/views/CallingDesk.tsx');
let code = fs.readFileSync(callingDeskPath, 'utf8');

// 1. Update default interviewer in CallingDesk.tsx
code = code.replace(
  "const [interviewerName, setInterviewerName] = useState('Dr Sharmila Yadav');\r\n  const [interviewerRole, setInterviewerRole] = useState('HR Recruiter');",
  "const [interviewerName, setInterviewerName] = useState('Satyaveer Singh');\r\n  const [interviewerRole, setInterviewerRole] = useState('HR Recruiter / Screening Lead');"
);
code = code.replace(
  "const [interviewerName, setInterviewerName] = useState('Dr Sharmila Yadav');\n  const [interviewerRole, setInterviewerRole] = useState('HR Recruiter');",
  "const [interviewerName, setInterviewerName] = useState('Satyaveer Singh');\n  const [interviewerRole, setInterviewerRole] = useState('HR Recruiter / Screening Lead');"
);

// 2. Update interviewer select in CallingDesk.tsx
const oldCallingInput = `<input
                          type="text"
                          value={interviewerName}
                          onChange={(e) => setInterviewerName(e.target.value)}
                          placeholder="Dr Sharmila Yadav"
                          className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-bold"
                        />`;

const newCallingSelect = `<select
                          value={interviewerName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInterviewerName(val);
                            if (val === 'Satyaveer Singh') setInterviewerRole('HR Recruiter / Screening Lead');
                            else if (val.includes('CEO')) setInterviewerRole('Chief Executive Officer');
                            else setInterviewerRole('Director HR / Final Evaluation');
                          }}
                          className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-bold outline-none"
                        >
                          <option value="Satyaveer Singh">Satyaveer Singh (R1 Screening Lead)</option>
                          <option value="Dr Sharmila Yadav">Dr Sharmila Yadav (Director HR / R2)</option>
                          <option value="CEO (Urban Gaon)">CEO (Urban Gaon / Leadership)</option>
                        </select>`;

code = code.replace(oldCallingInput, newCallingSelect);
// Also try with \r\n if needed
code = code.replace(oldCallingInput.replace(/\n/g, '\r\n'), newCallingSelect.replace(/\n/g, '\r\n'));

// Update interviewerEmail in interviewData
code = code.replace(
  "interviewerEmail: interviewerName === 'Satyaveer Singh' ? 'satyaveer.singh@urbangaon.com' : 'sharmila.yadav@urbangaon.com',",
  "interviewerEmail: interviewerName === 'Satyaveer Singh' ? 'satyaveer.singh@urbangaon.com' : (interviewerName.includes('CEO') ? 'jobs@urbangaon.com' : 'sharmila.yadav@urbangaon.com'),"
);

fs.writeFileSync(callingDeskPath, code, 'utf8');
console.log('✅ CallingDesk.tsx updated!');
