export const FEEDBACK_SUMMARY = {
  averageRating: 4.7,
  totalReviews: 342,
  positivePercentage: '91.2%',
  negativePercentage: '3.5%',
  npsScore: 78,
  promoters: 268,
  passives: 62,
  detractors: 12
};

export const RATING_DISTRIBUTION = [
  { rating: '5 Stars', count: 232, percentage: 67.8, fill: '#0d9488' },
  { rating: '4 Stars', count: 79, percentage: 23.1, fill: '#3b82f6' },
  { rating: '3 Stars', count: 19, percentage: 5.6, fill: '#f59e0b' },
  { rating: '2 Stars', count: 8, percentage: 2.3, fill: '#f97316' },
  { rating: '1 Star', count: 4, percentage: 1.2, fill: '#ef4444' }
];

export const BRANCH_SATISFACTION = [
  { branch: 'Bengaluru', rating: 4.9, reviews: 88, nps: 84 },
  { branch: 'Mumbai', rating: 4.8, reviews: 104, nps: 78 },
  { branch: 'Hyderabad', rating: 4.7, reviews: 76, nps: 75 },
  { branch: 'Pune', rating: 4.6, reviews: 52, nps: 72 },
  { branch: 'Nagpur', rating: 4.1, reviews: 22, nps: 58 }
];

export const INITIAL_REVIEWS = [
  {
    id: 1,
    customerName: 'Aarav Malhotra',
    branch: 'Mumbai',
    tourPackage: 'Kerala Backwaters & Tea Gardens',
    rating: 5,
    date: '18 Nov 2026',
    comment: 'The houseboat experience in Alleppey was magnificent. Freshly cooked Karimeen fish and sunset on Vembanad lake made our anniversary trip unforgettable. Seamless coordination from Mumbai office!',
    sentiment: 'Positive',
    responseStatus: 'Responded',
    officialResponse: 'Thank you Aarav! We are delighted you enjoyed your anniversary celebration with us.'
  },
  {
    id: 2,
    customerName: 'Rahul Sundaram',
    branch: 'Bengaluru',
    tourPackage: 'Himachal Snow Paradise',
    rating: 5,
    date: '15 Nov 2026',
    comment: 'Exceptional tour leadership by our guide Amit Verma. Snow gear arrangements at Solang valley were top-notch and our cab driver was courteous and safe across winding mountain roads.',
    sentiment: 'Positive',
    responseStatus: 'Responded',
    officialResponse: 'We appreciate the kind words, Rahul! We will pass your praise along to Amit Verma.'
  },
  {
    id: 3,
    customerName: 'Pooja Deshmukh',
    branch: 'Mumbai',
    tourPackage: 'Goa Coastal Weekend Break',
    rating: 5,
    date: '14 Nov 2026',
    comment: 'Quick and responsive booking support from Utkarsh at the Mumbai outlet. The resort in Varca was calm, clean, and right on the beach.',
    sentiment: 'Positive',
    responseStatus: 'Responded',
    officialResponse: 'Glad you had a refreshing break, Pooja!'
  },
  {
    id: 4,
    customerName: 'Vikram Sethi',
    branch: 'Nagpur',
    tourPackage: 'Himachal Snow Paradise',
    rating: 2,
    date: '12 Nov 2026',
    comment: 'Had to cancel due to personal reasons. While the refund was processed, communication from the local Nagpur branch representative took over 48 hours to confirm cancellation terms.',
    sentiment: 'Negative',
    responseStatus: 'Pending Action',
    officialResponse: null
  },
  {
    id: 5,
    customerName: 'Sanjay Reddy',
    branch: 'Hyderabad',
    tourPackage: 'Kashmir Paradise Odyssey',
    rating: 4,
    date: '10 Nov 2026',
    comment: 'Scenic tour and great Shikara ride in Dal lake. The Gondola queue was long on Day 3, but the views from Phase 2 were completely worth it.',
    sentiment: 'Positive',
    responseStatus: 'Responded',
    officialResponse: 'Thank you Sanjay. We are currently implementing VIP express gondola passes to reduce queue wait times.'
  }
];
