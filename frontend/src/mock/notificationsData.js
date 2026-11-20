export const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Nagpur Revenue Alert: Deficit Exceeds Threshold',
    message: 'Nagpur branch has fallen below the 75% achievement threshold (Current: 71.43%). Head office intervention recommended.',
    category: 'Branch Performance',
    priority: 'Critical',
    isRead: false,
    timestamp: '15 mins ago',
    branch: 'Nagpur',
    actionRoute: '/performance'
  },
  {
    id: 2,
    title: 'Low Inventory Alert: Kerala Backwaters (2 Slots Remaining)',
    message: 'Only 2 available slots remain for Kerala Backwaters departure on 20 Nov 2026. Review extra room allotment.',
    category: 'Inventory',
    priority: 'Warning',
    isRead: false,
    timestamp: '45 mins ago',
    branch: 'Mumbai',
    actionRoute: '/packages'
  },
  {
    id: 3,
    title: 'Audit Warning: High Cancellation Rate Flagged',
    message: 'Nagpur outlet recorded 18 cancellations out of 110 bookings (16.36%). Audit ticket AUD-2026-08 generated for review.',
    category: 'System',
    priority: 'Critical',
    isRead: false,
    timestamp: '2 hours ago',
    branch: 'Nagpur',
    actionRoute: '/audit'
  },
  {
    id: 4,
    title: 'Booking Confirmed: Aarav Malhotra (₹1,02,000)',
    message: 'Full payment received and travel manifest confirmed for 3 pax to Kerala Backwaters.',
    category: 'Bookings',
    priority: 'Info',
    isRead: true,
    timestamp: '3 hours ago',
    branch: 'Mumbai',
    actionRoute: '/bookings'
  },
  {
    id: 5,
    title: 'Staff Schedule Check: 8 of 9 Agents Checked In',
    message: 'Morning shift operational. Ankita Sawant marked on pre-approved leave.',
    category: 'Staff',
    priority: 'Info',
    isRead: true,
    timestamp: '5 hours ago',
    branch: 'Mumbai',
    actionRoute: '/staff'
  },
  {
    id: 6,
    title: 'Monthly Royalty Payment Settled: Bengaluru',
    message: 'Franchise royalty fee of ₹40,000 for October-November period processed successfully by Bengaluru outlet.',
    category: 'Finance',
    priority: 'Info',
    isRead: true,
    timestamp: '1 day ago',
    branch: 'Bengaluru',
    actionRoute: '/finance'
  }
];
