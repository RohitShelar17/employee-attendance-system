import { apiClient, unwrap } from '../../api/axiosClient';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse, PageResponse } from '../../types/api';
import type {
  AttendanceCalendar,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  BreakTypeOption,
  PunchPayload,
} from '../../types/attendance';

export const attendanceApi = {
  status: async (): Promise<AttendanceStatus> =>
    unwrap(await apiClient.get<ApiResponse<AttendanceStatus>>(endpoints.attendance.myStatus)),

  punchIn: async (payload: PunchPayload): Promise<Record<string, unknown>> =>
    unwrap(await apiClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.attendance.punchIn, payload)),

  punchOut: async (payload: PunchPayload): Promise<Record<string, unknown>> =>
    unwrap(await apiClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.attendance.punchOut, payload)),

  startBreak: async (breakTypeCode?: string): Promise<Record<string, unknown>> =>
    unwrap(await apiClient.post<ApiResponse<Record<string, unknown>>>(
      endpoints.attendance.breakStart, { breakTypeCode })),

  endBreak: async (): Promise<Record<string, unknown>> =>
    unwrap(await apiClient.post<ApiResponse<Record<string, unknown>>>(endpoints.attendance.breakEnd)),

  breakTypes: async (): Promise<BreakTypeOption[]> =>
    unwrap(await apiClient.get<ApiResponse<BreakTypeOption[]>>(endpoints.attendance.breakTypes)),

  history: async (params: {
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AttendanceRecord>> =>
    unwrap(await apiClient.get<ApiResponse<PageResponse<AttendanceRecord>>>(
      endpoints.attendance.myHistory, { params })),

  calendar: async (year: number, month: number): Promise<AttendanceCalendar> =>
    unwrap(await apiClient.get<ApiResponse<AttendanceCalendar>>(
      endpoints.attendance.myCalendar, { params: { year, month } })),

  summary: async (year: number, month: number): Promise<AttendanceSummary> =>
    unwrap(await apiClient.get<ApiResponse<AttendanceSummary>>(
      endpoints.attendance.mySummary, { params: { year, month } })),
};
