import fs from 'node:fs';
import path from 'node:path';

function createResumePdf() {
  const content = `
BT
/F1 20 Tf
50 780 Td
(MALEK HUSSEIN) Tj
/F2 11 Tf
0 -18 Td
(Technical Product Leader | Ottawa, ON, Canada | contact@mrmalek.com | +1 343 552 7477) Tj

/F1 13 Tf
0 -26 Td
(PROFESSIONAL SUMMARY) Tj
/F2 9.5 Tf
0 -14 Td
(Technical Product Leader with 8+ years leading complex digital products across SaaS, e-commerce, fintech,) Tj
0 -12 Td
(and enterprise platforms. Proven track record turning vague business goals into high-velocity engineering delivery.) Tj

/F1 13 Tf
0 -24 Td
(PROFESSIONAL EXPERIENCE) Tj

/F1 10.5 Tf
0 -16 Td
(Technical Delivery Lead \\(Co-op\\) | ASL Agrodrain | Ottawa, ON \\(Jan 2025 - Jun 2026\\)) Tj
/F2 9 Tf
0 -13 Td
(- Programme Coordination: Monitored project timelines, budget allocations, operational turnaround improved by 15%.) Tj
0 -11 Td
(- Administrative Compliance: Reviewed project documentation, cost plans, and operational SOP guidelines.) Tj

/F1 10.5 Tf
0 -16 Td
(Senior Technical Product & Delivery Lead | Qawafel | Remote / MENA \\(Jan 2024 - Dec 2025\\)) Tj
/F2 9 Tf
0 -13 Td
(- End to End Project Administration: Coordinated medium to large multi-stage project initiatives and deliverables.) Tj
0 -11 Td
(- ERP & Data Systems: Managed technical workflows within enterprise systems, resolving bottlenecks.) Tj
0 -11 Td
(- Budget Tracking: Conducted variance analysis for executive leadership, reducing budget overruns by 12%.) Tj

/F1 10.5 Tf
0 -16 Td
(Technical Product Lead / Business Analyst | Pass On | Remote \\(Jan 2022 - Jan 2024\\)) Tj
/F2 9 Tf
0 -13 Td
(- Process Optimization: Streamlined operational workflows, eliminating 8 redundant steps for 39% efficiency gain.) Tj
0 -11 Td
(- Documentation: Authored briefing notes, sprint specifications, and executive data visualizations.) Tj

/F1 10.5 Tf
0 -16 Td
(Technical Product Manager | Lendo | Remote / MENA \\(Jan 2021 - Dec 2021\\)) Tj
/F2 9 Tf
0 -13 Td
(- FinTech Compliance: Managed regulatory documentation, audit readiness, and banking API integrations.) Tj
0 -11 Td
(- Data Analytics: Monitored platform indicators with database tools, boosting reporting accuracy by 25%.) Tj

/F1 10.5 Tf
0 -16 Td
(Delivery Lead & Scrum Master | Dopravo | Remote \\(Jul 2018 - Dec 2020\\)) Tj
/F2 9 Tf
0 -13 Td
(- Facilitated agile delivery sessions, coached team members, increasing deliverable velocity by 45%.) Tj

/F1 13 Tf
0 -22 Td
(EDUCATION & DIPLOMAS) Tj
/F2 9 Tf
0 -13 Td
(- Master of Science in Information Technology Systems — Syracuse University, Syracuse, NY) Tj
0 -11 Td
(- Graduate Certificate in Project Management — Algonquin College, Ottawa, ON) Tj
0 -11 Td
(- Bachelor of Science in Computer Science — Girne American University, Kyrenia) Tj

/F1 13 Tf
0 -20 Td
(CERTIFICATIONS) Tj
/F2 9 Tf
0 -13 Td
(Certified ScrumMaster \\(CSM\\) | Salesforce Administrator | Google PM | AWS AI Practitioner | Google AI | Six Sigma) Tj
ET
`.trim();

  const streamLen = Buffer.byteLength(content);

  const objects = [
    // 1: Catalog
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    // 2: Pages
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    // 3: Page
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`,
    // 4: Stream
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${content}\nendstream\nendobj\n`,
    // 5: Font F1 (Bold)
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
    // 6: Font F2 (Regular)
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const outputPath = path.join(process.cwd(), 'public/cv-malek-hussein.pdf');
  fs.writeFileSync(outputPath, pdf, 'binary');
  console.log(`Created valid PDF: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
}

createResumePdf();
