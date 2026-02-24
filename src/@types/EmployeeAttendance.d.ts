// สำหรับ record ของประวัติการเข้างานตาม Employee ID
// API: GET /attendance/history/{employee_id}?page=1&limit=20
export interface EmployeeAttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: string;
  check_in_device: string;
  check_in_confidence: number;
  check_out_device: string;
  check_out_confidence: number;
}

// สำหรับการตอบกลับของ API /attendance/history/{employee_id}
export interface EmployeeAttendanceResponse {
  records: EmployeeAttendanceRecord[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
