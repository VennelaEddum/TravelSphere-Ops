export const INSIGHTS_SUMMARY = {
  healthIndex: 88, // out of 100
  healthStatus: 'Strong Growth with Regional Variance',
  totalInsights: 6,
  criticalActions: 2,
  potentialRevenueGain: 280000,
  riskMitigationValue: 145000
};

export const AI_INSIGHT_CARDS = [
  {
    id: 'INS-01',
    agent: 'Outlet Performance Agent',
    title: 'Nagpur Revenue Deficit & Cancellation Spike Recovery',
    category: 'Revenue Optimization',
    priority: 'Critical',
    confidence: '96.2%',
    status: 'Action Pending',
    summary: 'Nagpur outlet is operating ₹1,00,000 below target (71.4% achievement) with cancellations reaching 16.3% (more than double the franchise average of 7.2%).',
    impactPrediction: '₹85,000 revenue recovery within 14 days if action plan is executed.',
    recommendedActions: [
      'Reallocate ₹25,000 of Nagpur marketing budget from local print ads to targeted Instagram lead generation for Goa and Rajasthan weekend packages.',
      'Deploy instant WhatsApp booking confirmation workflows to reduce customer cancellation anxiety.',
      'Schedule a mandatory operational review with Nagpur franchise partner Rujaal Ghate.'
    ]
  },
  {
    id: 'INS-02',
    agent: 'Inventory Agent',
    title: 'Kerala Backwaters & Goa Weekend Package Demand Surge',
    category: 'Inventory & Slots',
    priority: 'High',
    confidence: '94.8%',
    status: 'In Progress',
    summary: 'Winter travel demand forecasting indicates Goa and Kerala packages will sell out 18 days earlier than last year. Mumbai and Bengaluru have only 4 and 2 slots remaining respectively.',
    impactPrediction: 'Captures additional ₹1,95,000 gross margin by expanding vendor room blocks.',
    recommendedActions: [
      'Negotiate 10 additional room nights with Taj Exotica (Goa) and 4 additional luxury houseboats in Alleppey.',
      'Implement dynamic tiered pricing (+8%) on remaining late-booking slots for departures after 15 Dec 2026.'
    ]
  },
  {
    id: 'INS-03',
    agent: 'Marketing Agent',
    title: 'Meta Ads Outperforming Search by 3.2x ROI in Tech Hubs',
    category: 'Marketing Efficiency',
    priority: 'Medium',
    confidence: '92.4%',
    status: 'Automated Recommendation',
    summary: 'In Bengaluru and Hyderabad, Meta video ads for Himachal snow tours are yielding a cost per acquisition (CPA) of ₹1,714 compared to ₹3,400 on Google Search.',
    impactPrediction: 'Saves ₹35,000 in customer acquisition costs while increasing lead volume by 28%.',
    recommendedActions: [
      'Shift 20% of Google Search budget in Bengaluru and Hyderabad into high-performing Instagram Reels campaigns.'
    ]
  },
  {
    id: 'INS-04',
    agent: 'Audit Agent',
    title: 'High-Altitude Tour Mandatory Medical Insurance Gap',
    category: 'SOP Compliance',
    priority: 'High',
    confidence: '98.5%',
    status: 'Immediate Fix Required',
    summary: '8 bookings for Himachal & Kashmir departures from Pune lack mandatory emergency evacuation insurance declarations.',
    impactPrediction: 'Mitigates potential ₹5,00,000 franchisee legal and medical liability.',
    recommendedActions: [
      'Lock voucher generation until travel insurance policy number is verified in the system.',
      'Auto-send SMS reminders to pending travelers with 1-click insurance purchase link.'
    ]
  }
];
