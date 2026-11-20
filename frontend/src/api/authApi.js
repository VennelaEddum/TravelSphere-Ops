import api from './client.js';
import { ROLES } from '../utils/rolePermissions.js';

// Development Demo Accounts for the Four Application Roles
export const DEMO_ACCOUNTS = {
  [ROLES.SUPER_ADMIN]: {
    id: 1,
    email: 'admin@travelsphere.demo',
    password: 'Admin@123',
    name: 'Rujaal Ghate',
    role: ROLES.SUPER_ADMIN,
    title: 'Head Office Administrator',
    franchiseId: null,
    franchiseName: 'Global Network',
    branchId: null,
    branchName: 'All Branches',
    city: 'Mumbai HQ',
    assignedModules: ['all']
  },
  [ROLES.FRANCHISE_OWNER]: {
    id: 2,
    email: 'owner@travelsphere.demo',
    password: 'Owner@123',
    name: 'Vennela Eddum',
    role: ROLES.FRANCHISE_OWNER,
    title: 'Franchise Partner & Principal',
    franchiseId: 1,
    franchiseName: 'West Coast Tourism Holdings',
    branchId: null,
    branchName: 'West Coast Franchise (Mumbai & Pune)',
    city: 'Mumbai, Maharashtra',
    assignedModules: ['franchise-management', 'finance-performance', 'booking-resources', 'workforce', 'customer-marketing', 'franchise-intelligence', 'ai-assistant', 'notifications']
  },
  [ROLES.BRANCH_MANAGER]: {
    id: 3,
    email: 'manager@travelsphere.demo',
    password: 'Manager@123',
    name: 'Utkarsh Sharma',
    role: ROLES.BRANCH_MANAGER,
    title: 'Branch Operations Manager',
    franchiseId: 1,
    franchiseName: 'West Coast Tourism Holdings',
    branchId: 1,
    branchName: 'Mumbai',
    city: 'Mumbai, Maharashtra',
    assignedModules: ['booking-resources', 'workforce', 'customer-marketing', 'ai-assistant', 'notifications']
  },
  [ROLES.STAFF]: {
    id: 4,
    email: 'staff@travelsphere.demo',
    password: 'Staff@123',
    name: 'Sneha Rao',
    role: ROLES.STAFF,
    title: 'Senior Travel Consultant & Booking Specialist',
    franchiseId: 1,
    franchiseName: 'West Coast Tourism Holdings',
    branchId: 1,
    branchName: 'Mumbai',
    city: 'Mumbai, Maharashtra',
    assignedModules: ['booking-resources', 'workforce', 'customer-marketing', 'ai-assistant', 'notifications']
  }
};

// Also keep backward compatibility lookup for old alias
DEMO_ACCOUNTS['Franchise Manager'] = DEMO_ACCOUNTS[ROLES.BRANCH_MANAGER];

// Initial Mock Registration Requests for local fallback
const INITIAL_MOCK_REGISTRATIONS = [
  {
    id: 1,
    reference_id: 'REG-2026-4821',
    full_name: 'Amitabh Sen',
    email: 'amitabh.sen@bengalurux.in',
    phone: '+91 98450 12345',
    account_type: 'Franchise Owner',
    org_name: 'Sen Heritage Journeys LLP',
    branch_name: 'Bengaluru Central',
    location: 'Bengaluru, Karnataka',
    license_type: 'Master Territory Franchise',
    auth_code: null,
    status: 'PENDING',
    rejection_reason: null,
    submitted_at: '2026-11-19 14:30:00',
    reviewed_at: null,
    reviewed_by: null
  },
  {
    id: 2,
    reference_id: 'REG-2026-3190',
    full_name: 'Priyanka Kulkarni',
    email: 'priyanka.k@punetours.in',
    phone: '+91 98220 88776',
    account_type: 'Branch Manager',
    org_name: 'Western Ghats Expeditions',
    branch_name: 'Pune',
    location: 'Pune, Maharashtra',
    license_type: 'Standard Unit Franchise',
    auth_code: 'INV-PUN-2026',
    status: 'PENDING',
    rejection_reason: null,
    submitted_at: '2026-11-19 16:15:20',
    reviewed_at: null,
    reviewed_by: null
  },
  {
    id: 3,
    reference_id: 'REG-2026-2041',
    full_name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@nagpurtravel.in',
    phone: '+91 98230 44321',
    account_type: 'Franchise Owner',
    org_name: 'Vidarbha Tourism Network',
    branch_name: 'Nagpur East',
    location: 'Nagpur, Maharashtra',
    license_type: 'Standard Unit Franchise',
    auth_code: null,
    status: 'APPROVED',
    rejection_reason: null,
    submitted_at: '2026-11-18 10:20:00',
    reviewed_at: '2026-11-18 15:45:00',
    reviewed_by: 'Super Admin'
  }
];

let inMemoryRegistrations = [...INITIAL_MOCK_REGISTRATIONS];

const getStoredMockRegistrations = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('travelsphere_mock_registrations');
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return inMemoryRegistrations;
};

const saveStoredMockRegistrations = (list) => {
  inMemoryRegistrations = list;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('travelsphere_mock_registrations', JSON.stringify(list));
    }
  } catch (e) {
    // ignore
  }
};

/**
 * Perform login: tries backend first; falls back to demo accounts if backend is offline or credentials match demo
 */
export const loginUser = async (email, password) => {
  const cleanEmail = email.toLowerCase().trim();

  try {
    // Attempt live backend API
    const response = await api.post('/auth/login', { email: cleanEmail, password });
    if (response.data && response.data.token) {
      return {
        token: response.data.token,
        user: response.data.user,
        isDemo: response.data.isDemo || false
      };
    }
  } catch (err) {
    // If backend explicitly rejected with 403 or specific detail message (e.g. pending approval or rejected)
    if (err.response && err.response.data && err.response.data.detail) {
      throw new Error(err.response.data.detail);
    }
    console.warn('Backend authentication endpoint offline or unreachable. Checking development demo accounts.');
  }

  // Development Demo Accounts verification
  const demoMatch = Object.values(DEMO_ACCOUNTS).find(
    acc => acc.email.toLowerCase() === cleanEmail
  );

  if (demoMatch) {
    if (demoMatch.password === password) {
      const demoToken = `demo_jwt_token_${demoMatch.role.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      return {
        token: demoToken,
        user: { ...demoMatch },
        isDemo: true
      };
    } else {
      throw new Error('Invalid demo password. Please check your credentials or use quick demo login.');
    }
  }

  // Check offline mock registrations
  const mockReqs = getStoredMockRegistrations();
  const matchedReq = mockReqs.find(r => r.email.toLowerCase() === cleanEmail);
  if (matchedReq) {
    if (matchedReq.status === 'PENDING') {
      throw new Error(`Your registration request (${matchedReq.reference_id}) is currently awaiting Super Admin review. You will be able to log in once authorized.`);
    }
    if (matchedReq.status === 'REJECTED') {
      throw new Error(`Your registration application (${matchedReq.reference_id}) was not approved: ${matchedReq.rejection_reason || 'Please contact Head Office administration.'}`);
    }
  }

  throw new Error('Invalid email or password. Use demo accounts or verify backend credentials.');
};

/**
 * Register account request:
 * Submits to backend POST /api/v1/auth/register.
 */
export const registerUser = async (data) => {
  // Security guard: Super Admin is strictly forbidden in public registration
  if (data.role === ROLES.SUPER_ADMIN || data.accountType === 'Super Admin' || data.accountType === ROLES.SUPER_ADMIN) {
    throw new Error('Super Admin accounts cannot be created via public registration. Contact Head Office administration.');
  }

  if (data.role === ROLES.STAFF || data.accountType === 'Staff') {
    throw new Error('Staff accounts cannot be self-registered publicly. Staff accounts must be created or invited by an authorized Super Admin, Franchise Owner, or Branch Manager.');
  }

  // Attempt backend endpoint if available
  try {
    const response = await api.post('/auth/register', data);
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    if (err.response && err.response.data) {
      const errMsg = err.response.data.detail || err.response.data.message;
      if (errMsg) throw new Error(errMsg);
    }
    console.warn('Backend registration endpoint unreachable. Simulating registration workflow for review.');
  }

  // Duplicate email check against existing accounts
  const isDuplicate = Object.values(DEMO_ACCOUNTS).some(
    acc => acc.email.toLowerCase() === data.email.toLowerCase().trim()
  );

  if (isDuplicate) {
    throw new Error('An account with this email address already exists. Please sign in or use another email.');
  }

  // Simulated registration record awaiting Super Admin authorization
  const referenceId = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const submittedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newMock = {
    id: Date.now(),
    reference_id: referenceId,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    account_type: data.accountType,
    org_name: data.orgName || '',
    branch_name: data.branchName || 'Primary Branch',
    location: data.location || 'India',
    license_type: data.licenseType || 'Standard Unit Franchise',
    auth_code: data.authCode || null,
    status: 'PENDING',
    rejection_reason: null,
    submitted_at: submittedAt,
    reviewed_at: null,
    reviewed_by: null
  };

  const currentList = getStoredMockRegistrations();
  saveStoredMockRegistrations([newMock, ...currentList]);

  return {
    success: true,
    status: 'Pending Approval',
    referenceId,
    submittedAt,
    message: 'Your registration request has been submitted successfully and is awaiting Head Office review.'
  };
};

/**
 * Fetch registration requests for Super Admin review
 */
export const fetchRegistrationRequests = async (statusFilter = 'ALL') => {
  try {
    const response = await api.get('/admin/registrations', {
      params: { status: statusFilter }
    });
    if (response.data && response.data.requests) {
      return response.data;
    }
  } catch (err) {
    console.warn('Backend admin registrations endpoint unavailable. Returning cached/mock queue.');
  }

  const allReqs = getStoredMockRegistrations();
  const filtered = statusFilter && statusFilter !== 'ALL'
    ? allReqs.filter(r => r.status.toUpperCase() === statusFilter.toUpperCase())
    : allReqs;

  const pending = allReqs.filter(r => r.status === 'PENDING').length;
  const approved = allReqs.filter(r => r.status === 'APPROVED').length;
  const rejected = allReqs.filter(r => r.status === 'REJECTED').length;

  return {
    requests: filtered,
    summary: {
      total: allReqs.length,
      pending,
      approved,
      rejected
    }
  };
};

/**
 * Super Admin approves a registration request
 */
export const approveRegistrationRequest = async (refId, reviewer = 'Super Admin') => {
  try {
    const response = await api.post(`/admin/registrations/${refId}/approve`, {
      reviewed_by: reviewer
    });
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.detail) {
      throw new Error(err.response.data.detail);
    }
    console.warn('Backend unavailable, updating local mock state.');
  }

  const allReqs = getStoredMockRegistrations();
  const updated = allReqs.map(r => {
    if (r.reference_id === refId) {
      return {
        ...r,
        status: 'APPROVED',
        reviewed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        reviewed_by: reviewer,
        rejection_reason: null
      };
    }
    return r;
  });
  saveStoredMockRegistrations(updated);

  return {
    success: true,
    status: 'APPROVED',
    reference_id: refId,
    message: `Registration request ${refId} approved successfully.`
  };
};

/**
 * Super Admin rejects a registration request
 */
export const rejectRegistrationRequest = async (refId, reason = 'Application does not meet eligibility criteria', reviewer = 'Super Admin') => {
  try {
    const response = await api.post(`/admin/registrations/${refId}/reject`, {
      reason,
      reviewed_by: reviewer
    });
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.detail) {
      throw new Error(err.response.data.detail);
    }
    console.warn('Backend unavailable, updating local mock state.');
  }

  const allReqs = getStoredMockRegistrations();
  const updated = allReqs.map(r => {
    if (r.reference_id === refId) {
      return {
        ...r,
        status: 'REJECTED',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        reviewed_by: reviewer
      };
    }
    return r;
  });
  saveStoredMockRegistrations(updated);

  return {
    success: true,
    status: 'REJECTED',
    reference_id: refId,
    reason,
    message: `Registration request ${refId} rejected.`
  };
};

/**
 * Fetch workforce tasks with role-enforced scoping
 */
export const fetchWorkforceTasks = async (branchId = null, franchiseId = null) => {
  try {
    const params = {};
    if (branchId) params.requested_branch_id = branchId;
    if (franchiseId) params.requested_franchise_id = franchiseId;
    const response = await api.get('/workforce/tasks', { params });
    if (response.data) return response.data;
  } catch (err) {
    console.warn('Backend tasks endpoint unavailable, using mock tasks.');
  }

  return {
    tasks: [
      {
        task_id: 1,
        title: 'Verify Visa Documents for Swiss Alps Tour',
        description: 'Review passport validity and visa requirements for Mr. Mehra group (3 pax)',
        assigned_to: 4,
        assignee_name: 'Sneha Rao',
        assignee_role: 'Staff',
        branch_name: 'Mumbai',
        due_date: '2026-11-22',
        priority: 'High',
        status: 'In Progress'
      },
      {
        task_id: 2,
        title: 'Follow up with Kerala Backwaters Leads',
        description: 'Contact 5 warm leads from weekend campaign enquiry form',
        assigned_to: 4,
        assignee_name: 'Sneha Rao',
        assignee_role: 'Staff',
        branch_name: 'Mumbai',
        due_date: '2026-11-21',
        priority: 'Medium',
        status: 'Pending'
      },
      {
        task_id: 3,
        title: 'Reconfirm Luxury Coach for Goa Explorer',
        description: 'Call partner Coastal Translines for bus booking confirmation',
        assigned_to: 4,
        assignee_name: 'Sneha Rao',
        assignee_role: 'Staff',
        branch_name: 'Mumbai',
        due_date: '2026-11-23',
        priority: 'Low',
        status: 'Completed'
      },
      {
        task_id: 4,
        title: 'Conduct Weekly Mumbai Branch Safety Briefing',
        description: 'Hold mandatory operations sync with ground tour coordinators',
        assigned_to: 3,
        assignee_name: 'Utkarsh Sharma',
        assignee_role: 'Branch Manager',
        branch_name: 'Mumbai',
        due_date: '2026-11-24',
        priority: 'High',
        status: 'Pending'
      }
    ],
    count: 4,
    data_scope: 'Local Data',
    authorized_role: 'Demo'
  };
};

/**
 * Fetch bookings with role-enforced scoping
 */
export const fetchScopedBookings = async (branchId = null, franchiseId = null) => {
  try {
    const params = {};
    if (branchId) params.requested_branch_id = branchId;
    if (franchiseId) params.requested_franchise_id = franchiseId;
    const response = await api.get('/bookings', { params });
    if (response.data) return response.data;
  } catch (err) {
    console.warn('Backend bookings endpoint unavailable.');
  }

  return {
    bookings: [
      {
        booking_id: 1,
        booking_reference: 'TS-BK-2026-901',
        customer_name: 'Aarav Sharma',
        package_name: 'Majestic Rajasthan Royal Tour',
        branch_name: 'Mumbai',
        assigned_staff_name: 'Sneha Rao',
        travel_date: '2026-12-05',
        pax: 2,
        amount: 78000,
        status: 'Confirmed'
      },
      {
        booking_id: 2,
        booking_reference: 'TS-BK-2026-902',
        customer_name: 'Deepak & Neha Mehta',
        package_name: 'Kerala Backwaters & Houseboat Extravaganza',
        branch_name: 'Mumbai',
        assigned_staff_name: 'Sneha Rao',
        travel_date: '2026-12-12',
        pax: 4,
        amount: 115000,
        status: 'Confirmed'
      },
      {
        booking_id: 3,
        booking_reference: 'TS-BK-2026-903',
        customer_name: 'Priya Nair',
        package_name: 'Goa Coastal Heritage & Water Sports',
        branch_name: 'Mumbai',
        assigned_staff_name: 'Sneha Rao',
        travel_date: '2026-11-28',
        pax: 2,
        amount: 42000,
        status: 'Confirmed'
      }
    ],
    count: 3,
    data_scope: 'Local Scope'
  };
};

/**
 * Send query to role-aware TravelSphere AI Assistant
 */
export const sendAssistantChat = async (message, context = {}) => {
  try {
    const response = await api.post('/assistant/chat', { message, context });
    if (response.data) return response.data;
  } catch (err) {
    console.warn('Backend assistant chat offline. Returning role-aware local simulation.');
  }

  return {
    reply: `**[TravelSphere Ops AI - Operations Scope]**\n\nI have received your request: "${message}". As an intelligent operations co-pilot, I monitor tour slot inventory, regional SLA compliance, and workforce task deadlines.`,
    data_scope: 'Demonstration Assistant',
    authorized_role: 'Current User',
    is_demo: true
  };
};

/**
 * Fetch all users for User Management
 */
export const fetchAllUsers = async (roleFilter = 'ALL') => {
  try {
    const response = await api.get('/admin/users', { params: { role_filter: roleFilter } });
    if (response.data && response.data.users) return response.data.users;
  } catch (err) {
    console.warn('Backend users endpoint unavailable.');
  }

  return Object.values(DEMO_ACCOUNTS).map(acc => ({
    id: acc.id,
    email: acc.email,
    full_name: acc.name,
    role: acc.role,
    title: acc.title,
    branch_name: acc.branchName,
    franchise_name: acc.franchiseName || 'West Coast Tourism Holdings',
    is_active: 1
  }));
};

/**
 * Toggle user account status (activate/deactivate)
 */
export const toggleUserActive = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/toggle-status`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn('Backend toggle status unavailable.');
  }
  return { success: true, user_id: userId, message: 'Status updated (simulation).' };
};

/**
 * Provision new Staff account
 */
export const createStaffAccount = async (staffData) => {
  try {
    const response = await api.post('/admin/users/create-staff', staffData);
    if (response.data) return response.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.detail) {
      throw new Error(err.response.data.detail);
    }
    console.warn('Backend create staff unavailable.');
  }
  return { success: true, message: `Staff account provisioned for ${staffData.fullName}.` };
};

/**
 * Fetch franchise directory
 */
export const fetchFranchiseDirectory = async () => {
  try {
    const response = await api.get('/admin/franchises');
    if (response.data && response.data.franchises) return response.data.franchises;
  } catch (err) {
    console.warn('Backend franchises endpoint unavailable.');
  }
  return [];
};
