// ประเภทข้อมูลสำหรับการจัดการข้อมูลการเข้า-ออกงาน (Attendance)
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: string;
  ImageAttendance?: ImageAttendance[];
  images?: ImageAttendance[];
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

export interface ImageAttendance {
  ID?: string;
  ImageURL?: string;
  ImageType?: string;
  CreatedAt?: string;
  id?: string;
  image_url?: string;
  image_type?: string;
  created_at?: string;
}

// สำหรับการตอบกลับของ check-in/check-out ที่ส่งกลับมาเพียงรายการเดียว
export interface AttendanceSingleResponse {
  id: string;
  employee_id: string;
  ImageAttendance?: ImageAttendance[];
  images?: ImageAttendance[];
  check_in: string;
  check_out: string | null;
  work_hours: string;
  check_in_device: string | null;
  check_out_device: string | null;
  check_in_confidence: number | null;
  check_out_confidence: number | null;
}

// สำหรับการตอบกลับจากการวิเคราะห์ข้อมูลเข้างานของพนักงานรายบุคคล
export interface EmployeeAnalysisResponse {
  data: {
    summary: {
      total_work_minutes: number;
      success_days_count: number;
      partial_days_count: number;
      total_excess_minutes: number;
      avg_hours_per_day: number;
      performance_grade: string;
    };
    chart_data: {
      date: string;
      hours: number;
      status: boolean;
    }[];
  };
  ok: boolean;
}
