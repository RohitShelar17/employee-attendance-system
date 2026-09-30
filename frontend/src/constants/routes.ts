export const ROUTES = {
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  changePassword: '/change-password',

  dashboard: '/dashboard',
  teamDashboard: '/team',
  myAttendance: '/attendance',
  attendanceCalendar: '/attendance/calendar',
  leaveBalance: '/leave/balance',
  applyLeave: '/leave/apply',
  myLeaves: '/leave/history',
  leaveApprovals: '/approvals/leave',
  requestApprovals: '/approvals/requests',

  regularization: '/requests/regularization',
  workFromHome: '/requests/wfh',
  employees: '/employees',
  employeeNew: '/employees/new',
  employeeDetail: (id: number | string) => `/employees/${id}`,
  employeeEdit: (id: number | string) => `/employees/${id}/edit`,
  employeeImport: '/employees/import',

  adminDepartments: '/admin/departments',
  adminDesignations: '/admin/designations',
  adminOffices: '/admin/offices',
  adminShifts: '/admin/shifts',

  reports: '/reports',
  profile: '/profile',
  notifications: '/notifications',
  auditLogs: '/admin/audit-logs',

  forbidden: '/403',
} as const;
