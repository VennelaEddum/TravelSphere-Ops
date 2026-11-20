import { ROLES, ROUTE_PERMISSIONS, canUserAccessRoute } from './src/utils/rolePermissions.js';
import { formatCurrency, formatLakhs, formatPercent, formatNumber, formatDate } from './src/utils/formatters.js';
import {
  DEMO_ACCOUNTS,
  loginUser,
  registerUser,
  fetchRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest
} from './src/api/authApi.js';

console.log('====================================================');
console.log('TRAVELSPHERE OPS - COMPREHENSIVE FRONTEND TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// TEST 1: Formatters
console.log('--- 1. Testing Formatters ---');
assert(formatCurrency(450000).includes('4,50,000'), 'formatCurrency handles INR formatting');
assert(formatLakhs(2000000) === '₹20.00 L', 'formatLakhs formats ₹20.00 L correctly');
assert(formatPercent(112.5) === '112.5%', 'formatPercent formats 112.5%');
assert(formatNumber(845) === '845', 'formatNumber formats 845');
assert(formatDate('2026-11-18').includes('2026'), 'formatDate formats 2026-11-18');

// TEST 2: Demo Accounts Verification (All 4 Roles)
console.log('\n--- 2. Testing 4-Role Demo Accounts Configuration ---');
assert(DEMO_ACCOUNTS[ROLES.SUPER_ADMIN].email === 'admin@travelsphere.demo', 'Super Admin email is admin@travelsphere.demo');
assert(DEMO_ACCOUNTS[ROLES.FRANCHISE_OWNER].email === 'owner@travelsphere.demo', 'Franchise Owner email is owner@travelsphere.demo');
assert(DEMO_ACCOUNTS[ROLES.BRANCH_MANAGER].email === 'manager@travelsphere.demo', 'Branch Manager email is manager@travelsphere.demo');
assert(DEMO_ACCOUNTS[ROLES.STAFF].email === 'staff@travelsphere.demo', 'Staff email is staff@travelsphere.demo');
assert(DEMO_ACCOUNTS[ROLES.FRANCHISE_OWNER].franchiseId === 1, 'Franchise Owner belongs to Franchise 1');
assert(DEMO_ACCOUNTS[ROLES.BRANCH_MANAGER].branchId === 1, 'Branch Manager belongs to Branch 1 (Mumbai)');
assert(DEMO_ACCOUNTS[ROLES.STAFF].branchId === 1, 'Staff belongs to Branch 1 (Mumbai)');

// TEST 3: Login Authentication for All 4 Roles
console.log('\n--- 3. Testing Authentication for All 4 Roles ---');
const adminLogin = await loginUser('admin@travelsphere.demo', 'Admin@123');
assert(adminLogin.user.role === ROLES.SUPER_ADMIN && adminLogin.isDemo === true, 'Super Admin logs in successfully');

const ownerLogin = await loginUser('owner@travelsphere.demo', 'Owner@123');
assert(ownerLogin.user.role === ROLES.FRANCHISE_OWNER && ownerLogin.user.franchiseId === 1, 'Franchise Owner logs in successfully');

const managerLogin = await loginUser('manager@travelsphere.demo', 'Manager@123');
assert(managerLogin.user.role === ROLES.BRANCH_MANAGER && managerLogin.user.branchId === 1, 'Branch Manager logs in successfully');

const staffLogin = await loginUser('staff@travelsphere.demo', 'Staff@123');
assert(staffLogin.user.role === ROLES.STAFF && staffLogin.user.branchId === 1, 'Staff logs in successfully');

let wrongPassFailed = false;
try {
  await loginUser('admin@travelsphere.demo', 'WrongPass@999');
} catch (err) {
  wrongPassFailed = true;
}
assert(wrongPassFailed, 'Rejects incorrect password');

let wrongEmailFailed = false;
try {
  await loginUser('nonexistent@domain.com', 'SomePass@123');
} catch (err) {
  wrongEmailFailed = true;
}
assert(wrongEmailFailed, 'Rejects nonexistent email address');

// TEST 4: Role-Based Route Permissions (Consolidated 9 Parent Pages)
console.log('\n--- 4. Testing Consolidated 9-Route Access Matrix (RBAC) ---');
// Super Admin Permissions
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/dashboard'), 'Super Admin -> /dashboard');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/franchise-management'), 'Super Admin -> /franchise-management');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/finance-performance'), 'Super Admin -> /finance-performance');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/booking-resources'), 'Super Admin -> /booking-resources');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/workforce'), 'Super Admin -> /workforce');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/customer-marketing'), 'Super Admin -> /customer-marketing');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/franchise-intelligence'), 'Super Admin -> /franchise-intelligence');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/ai-assistant'), 'Super Admin -> /ai-assistant');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/notifications'), 'Super Admin -> /notifications');

// Franchise Owner Permissions
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/dashboard'), 'Franchise Owner -> /dashboard');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/franchise-management'), 'Franchise Owner -> /franchise-management');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/finance-performance'), 'Franchise Owner -> /finance-performance');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/booking-resources'), 'Franchise Owner -> /booking-resources');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/workforce'), 'Franchise Owner -> /workforce');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/customer-marketing'), 'Franchise Owner -> /customer-marketing');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/franchise-intelligence'), 'Franchise Owner -> /franchise-intelligence');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/ai-assistant'), 'Franchise Owner -> /ai-assistant');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/notifications'), 'Franchise Owner -> /notifications');

// Branch Manager Permissions
assert(canUserAccessRoute(ROLES.BRANCH_MANAGER, '/dashboard'), 'Branch Manager -> /dashboard');
assert(!canUserAccessRoute(ROLES.BRANCH_MANAGER, '/franchise-management'), 'Branch Manager is BLOCKED from /franchise-management');
assert(!canUserAccessRoute(ROLES.BRANCH_MANAGER, '/finance-performance'), 'Branch Manager is BLOCKED from /finance-performance');
assert(canUserAccessRoute(ROLES.BRANCH_MANAGER, '/booking-resources'), 'Branch Manager -> /booking-resources');
assert(canUserAccessRoute(ROLES.BRANCH_MANAGER, '/workforce'), 'Branch Manager -> /workforce');
assert(canUserAccessRoute(ROLES.BRANCH_MANAGER, '/customer-marketing'), 'Branch Manager -> /customer-marketing');
assert(!canUserAccessRoute(ROLES.BRANCH_MANAGER, '/franchise-intelligence'), 'Branch Manager is BLOCKED from /franchise-intelligence');
assert(canUserAccessRoute(ROLES.BRANCH_MANAGER, '/ai-assistant'), 'Branch Manager -> /ai-assistant');
assert(canUserAccessRoute(ROLES.BRANCH_MANAGER, '/notifications'), 'Branch Manager -> /notifications');

// Staff Permissions
assert(canUserAccessRoute(ROLES.STAFF, '/dashboard'), 'Staff -> /dashboard');
assert(!canUserAccessRoute(ROLES.STAFF, '/franchise-management'), 'Staff is BLOCKED from /franchise-management');
assert(!canUserAccessRoute(ROLES.STAFF, '/finance-performance'), 'Staff is BLOCKED from /finance-performance');
assert(canUserAccessRoute(ROLES.STAFF, '/booking-resources'), 'Staff -> /booking-resources');
assert(canUserAccessRoute(ROLES.STAFF, '/workforce'), 'Staff -> /workforce');
assert(canUserAccessRoute(ROLES.STAFF, '/customer-marketing'), 'Staff -> /customer-marketing');
assert(!canUserAccessRoute(ROLES.STAFF, '/franchise-intelligence'), 'Staff is BLOCKED from /franchise-intelligence');
assert(canUserAccessRoute(ROLES.STAFF, '/ai-assistant'), 'Staff -> /ai-assistant');
assert(canUserAccessRoute(ROLES.STAFF, '/notifications'), 'Staff -> /notifications');

// TEST 5: Legacy Route Backward Compatibility
console.log('\n--- 5. Testing Backward-Compatibility Route Checks ---');
assert(canUserAccessRoute(ROLES.SUPER_ADMIN, '/franchises'), 'Legacy /franchises mapped for Super Admin');
assert(canUserAccessRoute(ROLES.FRANCHISE_OWNER, '/performance'), 'Legacy /performance mapped for Franchise Owner');
assert(canUserAccessRoute(ROLES.BRANCH_MANAGER, '/bookings'), 'Legacy /bookings mapped for Branch Manager');
assert(canUserAccessRoute(ROLES.STAFF, '/bookings'), 'Legacy /bookings mapped for Staff');

// TEST 6: Registration Validation & Workflow
console.log('\n--- 6. Testing Registration Validation & Workflow ---');

// Security Guard: Super Admin registration blocked
let superAdminBlocked = false;
try {
  await registerUser({
    fullName: 'Test Admin',
    email: 'admin_test@example.com',
    accountType: ROLES.SUPER_ADMIN,
    password: 'Password@123'
  });
} catch (err) {
  superAdminBlocked = err.message.includes('Super Admin accounts cannot be created');
}
assert(superAdminBlocked, 'Registration rejects unauthorized Super Admin account creation');

// Security Guard: Staff self-registration blocked
let staffBlocked = false;
try {
  await registerUser({
    fullName: 'Test Staff',
    email: 'staff_test@example.com',
    accountType: ROLES.STAFF,
    password: 'Password@123'
  });
} catch (err) {
  staffBlocked = err.message.includes('Staff accounts cannot be self-registered');
}
assert(staffBlocked, 'Registration rejects unauthorized Staff self-registration');

// Valid Franchise Owner registration
const ownerReg = await registerUser({
  fullName: 'Vikram Joshi',
  email: 'vikram.joshi@sample-tours.in',
  phone: '9820112233',
  accountType: ROLES.FRANCHISE_OWNER,
  orgName: 'Western Trails LLP',
  branchName: 'Nashik Outlet',
  location: 'Nashik, Maharashtra',
  password: 'Password@123'
});
assert(ownerReg.status === 'Pending Approval' && ownerReg.referenceId.startsWith('REG-'), 'Franchise Owner registration creates Pending Approval request');

// Valid Branch Manager registration
const managerReg = await registerUser({
  fullName: 'Pooja Kulkarni',
  email: 'pooja.k@mumbai-tours.in',
  phone: '9833445566',
  accountType: ROLES.BRANCH_MANAGER,
  orgName: 'TravelSphere Franchises',
  branchName: 'Mumbai',
  authCode: 'INV-MUM-2026',
  password: 'Password@123'
});
assert(managerReg.status === 'Pending Approval' && managerReg.referenceId.startsWith('REG-'), 'Branch Manager registration creates Pending Approval request');

// Super Admin Approval
const testRefId = managerReg.referenceId;
const approveResult = await approveRegistrationRequest(testRefId, 'Super Admin Rujaal');
assert(approveResult.success === true && approveResult.status === 'APPROVED', 'Super Admin can approve registration request');

// Super Admin Rejection
const rejectRefId = ownerReg.referenceId;
const rejectResult = await rejectRegistrationRequest(rejectRefId, 'Documentation incomplete', 'Super Admin Rujaal');
assert(rejectResult.success === true && rejectResult.status === 'REJECTED', 'Super Admin can reject registration request with reason');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
