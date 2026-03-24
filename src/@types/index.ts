import type {
  AttendanceRecord,
  AttendanceResponse,
} from './Attendance';

// Re-use central Attendance types to avoid duplication across the codebase.
export type EmployeeAttendanceRecord = AttendanceRecord;
export type EmployeeAttendanceResponse = AttendanceResponse;
