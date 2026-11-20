export const INITIAL_CAMPAIGNS = [
  {
    id: 1,
    name: 'Winter Wonderland Himachal Snow Campaign',
    channel: 'Meta Ads (Instagram & FB)',
    targetBranch: 'All Branches',
    budget: 85000,
    spend: 72000,
    leads: 380,
    conversions: 42,
    cpc: 18.5,
    roi: '380%',
    status: 'Active',
    startDate: '01 Nov 2026',
    endDate: '15 Dec 2026'
  },
  {
    id: 2,
    name: 'Goa Weekend Getaway Flash Sale',
    channel: 'Google Search Ads',
    targetBranch: 'Mumbai',
    budget: 50000,
    spend: 48000,
    leads: 290,
    conversions: 35,
    cpc: 22.0,
    roi: '310%',
    status: 'Active',
    startDate: '10 Nov 2026',
    endDate: '30 Nov 2026'
  },
  {
    id: 3,
    name: 'Kerala Serene Backwaters Email Blast',
    channel: 'Email Marketing (Loyalty)',
    targetBranch: 'Bengaluru',
    budget: 15000,
    spend: 14200,
    leads: 185,
    conversions: 24,
    cpc: 8.0,
    roi: '540%',
    status: 'Active',
    startDate: '05 Nov 2026',
    endDate: '25 Nov 2026'
  },
  {
    id: 4,
    name: 'Kashmir Paradise Honeymoon Special',
    channel: 'Influencer & YouTube Collab',
    targetBranch: 'Hyderabad',
    budget: 70000,
    spend: 68000,
    leads: 240,
    conversions: 20,
    cpc: 35.0,
    roi: '260%',
    status: 'Active',
    startDate: '01 Nov 2026',
    endDate: '30 Nov 2026'
  },
  {
    id: 5,
    name: 'Nagpur Central Travel Expo & Print Ads',
    channel: 'Offline Newspapers & Banners',
    targetBranch: 'Nagpur',
    budget: 45000,
    spend: 44000,
    leads: 110,
    conversions: 12,
    cpc: 45.0,
    roi: '140%',
    status: 'Reviewing',
    startDate: '08 Nov 2026',
    endDate: '22 Nov 2026'
  }
];

export const CHANNEL_DISTRIBUTION = [
  { name: 'Meta Ads', spend: 115000, leads: 520, fill: '#0d9488' },
  { name: 'Google Search', spend: 95000, leads: 430, fill: '#3b82f6' },
  { name: 'Influencer Collab', spend: 70000, leads: 240, fill: '#8b5cf6' },
  { name: 'Email Marketing', spend: 25000, leads: 280, fill: '#10b981' },
  { name: 'Offline Print', spend: 45000, leads: 110, fill: '#f59e0b' }
];

export const FUNNEL_DATA = [
  { stage: 'Ad Impressions', count: 485000, rate: '100%' },
  { stage: 'Website Clicks', count: 32400, rate: '6.7%' },
  { stage: 'Trip Enquiries', count: 1580, rate: '4.9%' },
  { stage: 'Quotes Generated', count: 420, rate: '26.6%' },
  { stage: 'Confirmed Bookings', count: 133, rate: '31.7%' }
];
