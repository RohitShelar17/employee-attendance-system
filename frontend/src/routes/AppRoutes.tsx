import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PERMISSIONS } from '../constants/permissions';
import { ROUTES } from '../constants/routes';
import { PermissionGuard } from '../guards/PermissionGuard';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { PublicOnlyRoute } from '../guards/PublicOnlyRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ForbiddenPage } from '../pages/error/ForbiddenPage';
import { NotFoundPage } from '../pages/error/NotFoundPage';

/**
 * Every screen is loaded on demand.
 *
 * <p>Bundled together they came to 686 kB, which meant an employee who only
 * ever punches in and books leave still downloaded the audit viewer, the report
 * engine and the bulk importer before seeing anything. Splitting per route
 * costs a brief fallback the first time a screen is opened and nothing
 * thereafter.
 */
const ApplyLeavePage = lazy(() => import('../pages/employee/ApplyLeavePage').then((m) => ({ default: m.ApplyLeavePage })));
const AttendanceCalendarPage = lazy(() => import('../pages/employee/AttendanceCalendarPage').then((m) => ({ default: m.AttendanceCalendarPage })));
const AuditLogPage = lazy(() => import('../pages/admin/AuditLogPage').then((m) => ({ default: m.AuditLogPage })));
const BulkImportPage = lazy(() => import('../pages/hr/BulkImportPage').then((m) => ({ default: m.BulkImportPage })));
const ChangePasswordPage = lazy(() => import('../pages/employee/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })));
const DashboardPage = lazy(() => import('../pages/employee/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const DepartmentsPage = lazy(() => import('../pages/admin/DepartmentsPage').then((m) => ({ default: m.DepartmentsPage })));
const DesignationsPage = lazy(() => import('../pages/admin/DesignationsPage').then((m) => ({ default: m.DesignationsPage })));
const EmployeeDetailPage = lazy(() => import('../pages/hr/EmployeeDetailPage').then((m) => ({ default: m.EmployeeDetailPage })));
const EmployeeDirectoryPage = lazy(() => import('../pages/hr/EmployeeDirectoryPage').then((m) => ({ default: m.EmployeeDirectoryPage })));
const EmployeeFormPage = lazy(() => import('../pages/hr/EmployeeFormPage').then((m) => ({ default: m.EmployeeFormPage })));
const ForgotPasswordPage = lazy(() => import('../pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const LeaveApprovalsPage = lazy(() => import('../pages/manager/LeaveApprovalsPage').then((m) => ({ default: m.LeaveApprovalsPage })));
const LeaveBalancePage = lazy(() => import('../pages/employee/LeaveBalancePage').then((m) => ({ default: m.LeaveBalancePage })));
const LoginPage = lazy(() => import('../pages/public/LoginPage').then((m) => ({ default: m.LoginPage })));
const MyAttendancePage = lazy(() => import('../pages/employee/MyAttendancePage').then((m) => ({ default: m.MyAttendancePage })));
const MyLeavesPage = lazy(() => import('../pages/employee/MyLeavesPage').then((m) => ({ default: m.MyLeavesPage })));
const NotificationsPage = lazy(() => import('../pages/employee/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const OfficesPage = lazy(() => import('../pages/admin/OfficesPage').then((m) => ({ default: m.OfficesPage })));
const ProfilePage = lazy(() => import('../pages/employee/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const RegularizationPage = lazy(() => import('../pages/employee/RegularizationPage').then((m) => ({ default: m.RegularizationPage })));
const ReportsPage = lazy(() => import('../pages/manager/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const RequestApprovalsPage = lazy(() => import('../pages/manager/RequestApprovalsPage').then((m) => ({ default: m.RequestApprovalsPage })));
const ResetPasswordPage = lazy(() => import('../pages/public/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const ShiftsPage = lazy(() => import('../pages/admin/ShiftsPage').then((m) => ({ default: m.ShiftsPage })));
const TeamDashboardPage = lazy(() => import('../pages/manager/TeamDashboardPage').then((m) => ({ default: m.TeamDashboardPage })));
const WorkFromHomePage = lazy(() => import('../pages/employee/WorkFromHomePage').then((m) => ({ default: m.WorkFromHomePage })));

/** Shown only while a route's chunk is in flight, so it must be quiet. */
const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
    <span className="sr-only">Loading</span>
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
  </div>
);

export const AppRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
  <Routes>
    {/* Public */}
    <Route element={<PublicOnlyRoute />}>
      <Route
        path={ROUTES.login}
        element={
          <AuthLayout title="Welcome Back" subtitle="Please sign in to access your HRMS portal.">
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path={ROUTES.forgotPassword}
        element={
          <AuthLayout
            title="Forgot your password?"
            subtitle="Enter your work email and we will send you a reset link."
          >
            <ForgotPasswordPage />
          </AuthLayout>
        }
      />
      <Route
        path={ROUTES.resetPassword}
        element={
          <AuthLayout title="Set a new password" subtitle="Choose a password you have not used before.">
            <ResetPasswordPage />
          </AuthLayout>
        }
      />
    </Route>

    {/* Authenticated */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.changePassword} element={<ChangePasswordPage />} />
        <Route path={ROUTES.forbidden} element={<ForbiddenPage />} />
        <Route path={ROUTES.notifications} element={<NotificationsPage />} />

        {/* Employee self-service */}
        <Route element={<PermissionGuard anyOf={[PERMISSIONS.EMPLOYEE_VIEW_SELF]} />}>
          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>

        {/* Employee directory — the service narrows rows to the caller's scope */}
        <Route
          element={
            <PermissionGuard anyOf={[PERMISSIONS.EMPLOYEE_VIEW_ALL, PERMISSIONS.EMPLOYEE_VIEW_TEAM]} />
          }
        >
          <Route path={ROUTES.employees} element={<EmployeeDirectoryPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        </Route>

        <Route element={<PermissionGuard anyOf={[PERMISSIONS.EMPLOYEE_VIEW_ALL]} />}>
          <Route path={ROUTES.employeeNew} element={<EmployeeFormPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
          <Route path={ROUTES.employeeImport} element={<BulkImportPage />} />
        </Route>

        {/* Team and organisation view — the API decides how wide it is */}
        <Route
          element={
            <PermissionGuard
              anyOf={[PERMISSIONS.ATTENDANCE_VIEW_TEAM, PERMISSIONS.ATTENDANCE_VIEW_ALL]}
            />
          }
        >
          <Route path={ROUTES.teamDashboard} element={<TeamDashboardPage />} />
        </Route>

        {/* Attendance */}
        <Route element={<PermissionGuard anyOf={[PERMISSIONS.ATTENDANCE_VIEW_SELF]} />}>
          <Route path={ROUTES.myAttendance} element={<MyAttendancePage />} />
          <Route path={ROUTES.attendanceCalendar} element={<AttendanceCalendarPage />} />
        </Route>

        {/* Leave */}
        <Route element={<PermissionGuard anyOf={[PERMISSIONS.LEAVE_APPLY]} />}>
          <Route path={ROUTES.leaveBalance} element={<LeaveBalancePage />} />
          <Route path={ROUTES.applyLeave} element={<ApplyLeavePage />} />
          <Route path={ROUTES.myLeaves} element={<MyLeavesPage />} />
        </Route>

        {/* Approvals */}
        <Route
          element={
            <PermissionGuard anyOf={[PERMISSIONS.LEAVE_APPROVE_L1, PERMISSIONS.LEAVE_APPROVE_L2]} />
          }
        >
          <Route path={ROUTES.leaveApprovals} element={<LeaveApprovalsPage />} />
        </Route>

        <Route
          element={
            <PermissionGuard
              anyOf={[
                PERMISSIONS.REGULARIZATION_APPROVE_L1,
                PERMISSIONS.REGULARIZATION_APPROVE_L2,
                PERMISSIONS.WFH_APPROVE,
              ]}
            />
          }
        >
          <Route path={ROUTES.requestApprovals} element={<RequestApprovalsPage />} />
        </Route>

        {/* Requests */}
        <Route
          element={
            <PermissionGuard anyOf={[PERMISSIONS.REGULARIZATION_APPLY, PERMISSIONS.WFH_APPLY]} />
          }
        >
          <Route path={ROUTES.regularization} element={<RegularizationPage />} />
          <Route path={ROUTES.workFromHome} element={<WorkFromHomePage />} />
        </Route>

        {/* Reports */}
        <Route
          element={
            <PermissionGuard anyOf={[PERMISSIONS.REPORT_VIEW_TEAM, PERMISSIONS.REPORT_VIEW_ALL]} />
          }
        >
          <Route path={ROUTES.reports} element={<ReportsPage />} />
        </Route>

        {/* Admin master data */}
        <Route element={<PermissionGuard anyOf={['DEPARTMENT_MANAGE', 'DESIGNATION_MANAGE']} />}>
          <Route path={ROUTES.adminDepartments} element={<DepartmentsPage />} />
          <Route path={ROUTES.adminDesignations} element={<DesignationsPage />} />
        </Route>

        <Route element={<PermissionGuard anyOf={['OFFICE_MANAGE', 'GEOFENCE_MANAGE']} />}>
          <Route path={ROUTES.adminOffices} element={<OfficesPage />} />
        </Route>

        <Route element={<PermissionGuard anyOf={['SHIFT_MANAGE']} />}>
          <Route path={ROUTES.adminShifts} element={<ShiftsPage />} />
        </Route>

        <Route element={<PermissionGuard anyOf={[PERMISSIONS.AUDIT_VIEW]} />}>
          <Route path={ROUTES.auditLogs} element={<AuditLogPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
  </Suspense>
);
