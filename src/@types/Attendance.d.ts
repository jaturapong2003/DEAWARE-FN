export interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: string;
  check_in_device: string | null;
  check_in_confidence: number | null;
  check_out_device: string | null;
  check_out_confidence: number | null;
}

export interface AttendanceResponse {
  records: AttendanceRecord[];
  total: number;
}
