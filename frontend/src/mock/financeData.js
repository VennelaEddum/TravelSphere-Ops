export const FINANCE_SUMMARY = {
  totalRevenue: 2000000,
  totalExpenses: 1360000,
  netProfit: 640000,
  profitMargin: '32.0%',
  totalRoyaltyDue: 160000, // 8% standard franchise royalty
  royaltyCollected: 140000,
  royaltyPending: 20000
};

export const BRANCH_FINANCIALS = [
  {
    branch: 'Bengaluru',
    revenue: 500000,
    target: 420000,
    operatingCosts: 210000,
    payroll: 85000,
    marketing: 35000,
    netProfit: 170000,
    netMargin: '34.0%',
    royaltyDue: 40000,
    royaltyStatus: 'Paid'
  },
  {
    branch: 'Mumbai',
    revenue: 450000,
    target: 400000,
    operatingCosts: 195000,
    payroll: 90000,
    marketing: 40000,
    netProfit: 125000,
    netMargin: '27.8%',
    royaltyDue: 36000,
    royaltyStatus: 'Paid'
  },
  {
    branch: 'Hyderabad',
    revenue: 420000,
    target: 400000,
    operatingCosts: 180000,
    payroll: 75000,
    marketing: 30000,
    netProfit: 135000,
    netMargin: '32.1%',
    royaltyDue: 33600,
    royaltyStatus: 'Paid'
  },
  {
    branch: 'Pune',
    revenue: 380000,
    target: 400000,
    operatingCosts: 170000,
    payroll: 70000,
    marketing: 28000,
    netProfit: 112000,
    netMargin: '29.5%',
    royaltyDue: 30400,
    royaltyStatus: 'Paid'
  },
  {
    branch: 'Nagpur',
    revenue: 250000,
    target: 350000,
    operatingCosts: 145000,
    payroll: 60000,
    marketing: 25000,
    netProfit: 20000,
    netMargin: '8.0%',
    royaltyDue: 20000,
    royaltyStatus: 'Pending'
  }
];

export const MONTHLY_FINANCIAL_TREND = [
  { month: 'Jun 2026', revenue: 1620000, expenses: 1150000, profit: 470000 },
  { month: 'Jul 2026', revenue: 1750000, expenses: 1210000, profit: 540000 },
  { month: 'Aug 2026', revenue: 1810000, expenses: 1260000, profit: 550000 },
  { month: 'Sep 2026', revenue: 1890000, expenses: 1290000, profit: 600000 },
  { month: 'Oct 2026', revenue: 1940000, expenses: 1320000, profit: 620000 },
  { month: 'Nov 2026', revenue: 2000000, expenses: 1360000, profit: 640000 }
];

export const EXPENSE_CATEGORIES = [
  { name: 'Hotel & Resort Settlements', amount: 680000, percent: 50, fill: '#0d9488' },
  { name: 'Staff Salaries & Field Guides', amount: 380000, percent: 27.9, fill: '#3b82f6' },
  { name: 'Airline & Transport Partners', amount: 158000, percent: 11.6, fill: '#8b5cf6' },
  { name: 'Marketing & Digital Ads', amount: 92000, percent: 6.8, fill: '#f59e0b' },
  { name: 'IT Infrastructure & SaaS', amount: 50000, percent: 3.7, fill: '#10b981' }
];
