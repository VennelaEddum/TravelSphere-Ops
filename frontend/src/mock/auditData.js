export const AUDIT_SUMMARY = {
  overallComplianceScore: '91.4%',
  completedAudits: 14,
  pendingAudits: 2,
  criticalIssues: 1,
  resolvedIssues: 18
};

export const COMPLIANCE_CHECKLIST = [
  { id: 'SOP-01', title: 'Customer KYC & Government ID Verification', requirement: '100% of travelers must have Aadhaar or Passport verified prior to ticket issuance.', mandatory: true, status: 'Compliant' },
  { id: 'SOP-02', title: 'Travel Insurance Issuance for Hill & High-Altitude Tours', requirement: 'Mandatory emergency medical & evacuation coverage for Himachal, Kashmir & Sikkim.', mandatory: true, status: 'Compliant' },
  { id: 'SOP-03', title: 'Transport Vehicle Safety & Fitness Certificates', requirement: 'All coach and SUV vendor permits, commercial fitness, and driver licenses on file.', mandatory: true, status: 'Compliant' },
  { id: 'SOP-04', title: 'Cancellation Policy Disclosure & Refund SLA', requirement: 'Refunds must be acknowledged within 24 hours and settled within 5 banking days.', mandatory: true, status: 'Review Needed' },
  { id: 'SOP-05', title: 'Official Franchise Billing & GST Invoice Reconciliation', requirement: 'All bookings must generate serial GST invoices with Head Office franchise tax code.', mandatory: true, status: 'Compliant' }
];

export const INITIAL_AUDITS = [
  {
    id: 'AUD-2026-08',
    branch: 'Nagpur',
    auditor: 'Rajesh Nair (Head Office Audit)',
    auditDate: '16 Nov 2026',
    category: 'Cancellation & Refund SLA',
    score: 74,
    status: 'Non-Compliant',
    severity: 'Critical',
    findings: 'Cancellation notification delays exceeding 48 hours for booking BK-1077. Lack of standardized customer cancellation acknowledgment email.',
    correctiveAction: 'Deploy automated cancellation webhook and retrain Nagpur desk manager by 25 Nov 2026.'
  },
  {
    id: 'AUD-2026-07',
    branch: 'Mumbai',
    auditor: 'Snehal Deshpande (Quality Assurance)',
    auditDate: '12 Nov 2026',
    category: 'Passenger Manifest & Safety Audit',
    score: 96,
    status: 'Compliant',
    severity: 'Low',
    findings: 'All 210 passenger KYC records, medical declarations, and insurance policies properly filed and verified.',
    correctiveAction: 'None. Commended for exemplary operational compliance.'
  },
  {
    id: 'AUD-2026-06',
    branch: 'Bengaluru',
    auditor: 'Snehal Deshpande (Quality Assurance)',
    auditDate: '08 Nov 2026',
    category: 'Financial Invoicing & GST Reconciliation',
    score: 98,
    status: 'Compliant',
    severity: 'Low',
    findings: '100% invoice matching between local branch registers and Head Office tally accounts.',
    correctiveAction: 'None. Benchmark outlet.'
  },
  {
    id: 'AUD-2026-05',
    branch: 'Hyderabad',
    auditor: 'Rajesh Nair (Head Office Audit)',
    auditDate: '02 Nov 2026',
    category: 'Tour Partner & Vendor SLA Check',
    score: 92,
    status: 'Compliant',
    severity: 'Medium',
    findings: 'Minor delay in obtaining updated fitness certificate from one local bus operator.',
    correctiveAction: 'Updated fitness certificate uploaded on 05 Nov 2026.'
  },
  {
    id: 'AUD-2026-04',
    branch: 'Pune',
    auditor: 'Rajesh Nair (Head Office Audit)',
    auditDate: '26 Oct 2026',
    category: 'Staff Training & Emergency Response',
    score: 89,
    status: 'Compliant',
    severity: 'Medium',
    findings: 'Two junior booking consultants pending annual high-altitude crisis management certification.',
    correctiveAction: 'Consultants enrolled in training module scheduled for Dec 2026.'
  }
];
