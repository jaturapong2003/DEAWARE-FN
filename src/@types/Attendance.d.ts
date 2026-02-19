// ประเภทข้อมูลสำหรับการจัดการข้อมูลการเข้า-ออกงาน (Attendance)
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

// สำหรับการตอบกลับของ API ที่ส่งกลับมาหลายรายการ
export interface AttendanceResponse {
  records: AttendanceRecord[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// สำหรับการส่งข้อมูล check-in/check-out
export interface AttendanceRequest {
  device: 'web_app';
  confidence: number;
}

// สำหรับการตอบกลับของ check-in/check-out ที่ส่งกลับมาเพียงรายการเดียว
export interface AttendanceSingleResponse {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string;
  work_hours: string;
  check_in_device: string;
  check_out_device: string;
  check_in_confidence: number;
  check_out_confidence: number;
}
