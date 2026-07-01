export const MOCK_REVENUE_DATA = [
  { name: 'Jan', revenue: 82000, expenses: 41000 },
  { name: 'Feb', revenue: 74000, expenses: 38000 },
  { name: 'Mar', revenue: 91000, expenses: 44000 },
  { name: 'Apr', revenue: 85000, expenses: 40000 },
  { name: 'May', revenue: 98000, expenses: 46000 },
  { name: 'Jun', revenue: 102000, expenses: 48000 },
  { name: 'Jul', revenue: 110000, expenses: 52000 },
  { name: 'Aug', revenue: 97000, expenses: 45000 },
  { name: 'Sep', revenue: 115000, expenses: 53000 },
  { name: 'Oct', revenue: 121000, expenses: 56000 },
  { name: 'Nov', revenue: 118000, expenses: 54000 },
  { name: 'Dec', revenue: 135000, expenses: 62000 },
];

export const MOCK_OCCUPANCY = { occupied: 87, vacant: 13 };

export const MOCK_STATS = [
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    value: '$1.23M',
    change: '+12.5%',
    positive: true,
    detail: 'vs last year',
    color: 'primary',
  },
  {
    id: 'occupancy-rate',
    label: 'Occupancy Rate',
    value: '87%',
    change: '+3.2%',
    positive: true,
    detail: 'vs last month',
    color: 'success',
  },
  {
    id: 'active-leases',
    label: 'Active Leases',
    value: '214',
    change: '+8',
    positive: true,
    detail: 'this month',
    color: 'info',
  },
  {
    id: 'pending-payments',
    label: 'Pending Payments',
    value: '23',
    change: '-5',
    positive: false,
    detail: 'since last week',
    color: 'warning',
  },
];

export const MOCK_RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'lease',
    action: 'New lease signed',
    description: 'Bright Coffee Co. — Shop #112, Wing A',
    time: '5 minutes ago',
    color: 'success',
  },
  {
    id: 2,
    type: 'payment',
    action: 'Payment received',
    description: 'Shop #204 — $4,500 monthly rent',
    time: '23 minutes ago',
    color: 'info',
  },
  {
    id: 3,
    type: 'maintenance',
    action: 'Maintenance request',
    description: 'HVAC repair — Wing B, Floor 2',
    time: '1 hour ago',
    color: 'warning',
  },
  {
    id: 4,
    type: 'tenant',
    action: 'New tenant registered',
    description: 'Urban Threads Clothing — Shop #318',
    time: '3 hours ago',
    color: 'primary',
  },
  {
    id: 5,
    type: 'payment',
    action: 'Payment overdue',
    description: 'Shop #507 — $3,200 overdue by 3 days',
    time: '5 hours ago',
    color: 'danger',
  },
  {
    id: 6,
    type: 'mall',
    action: 'Mall report generated',
    description: 'November occupancy & revenue report ready',
    time: '1 day ago',
    color: 'gray',
  },
];

export const MOCK_TOP_SHOPS = [
  { name: 'Urban Eats Food Court', revenue: 28400, trend: '+8%' },
  { name: 'TechZone Electronics', revenue: 22100, trend: '+12%' },
  { name: 'Bright Coffee Co.', revenue: 18700, trend: '+5%' },
  { name: 'FashionHub Boutique', revenue: 15900, trend: '-2%' },
  { name: 'KidZone Play Area', revenue: 14200, trend: '+18%' },
];
