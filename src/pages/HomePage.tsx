import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import ProfileCard from '@/components/ProfileCard';
import CheckInOutButtons from '@/components/CheckInOutButtons';
import { useEmployee } from '@/hooks/useEmployee';
import { useAttendance } from '@/hooks/useAttendance';
import { useToast } from '@/components/Toast';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * หน้าหลัก - Responsive พร้อม Banner เตือน
 */
const HomePage: React.FC = () => {
  const { keycloak } = useKeycloak();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useEmployee();

  // ดึงข้อมูล user จาก Keycloak token
  const displayName = keycloak.tokenParsed?.name || 'ไม่ระบุชื่อ';
  const email = keycloak.tokenParsed?.email || '-';
  const userName = keycloak.tokenParsed?.preferred_username || '-';
  const {
    checkIn,
    checkOut,
    loading: actionLoading,
    checkInTime,
    checkOutTime,
  } = useAttendance();
  const toast = useToast();

  // คำนวณชั่วโมงปัจจุบัน
  const currentHour = new Date().getHours();

  // แสดง Loading
  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin sm:h-8 sm:w-8" />
        <span className="ml-2 text-sm sm:text-base">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  // แสดง Error
  if (profileError || !profile) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-center text-red-700 sm:p-6">
        <p className="text-sm sm:text-base">
          ❌ {profileError || 'ไม่สามารถโหลดข้อมูลได้'}
        </p>
      </div>
    );
  }

  // Handler สำหรับปุ่ม Check-in
  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success('เข้างานสำเร็จ!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เข้างานไม่สำเร็จ';
      toast.error(message);
    }
  };

  // Handler สำหรับปุ่ม Check-out
  const handleCheckOut = async () => {
    try {
      await checkOut();
      toast.success('ออกงานสำเร็จ!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ออกงานไม่สำเร็จ';
      toast.error(message);
    }
  };

  // กำหนด Banner ตามสถานะ
  const renderBanner = () => {
    // ✅ เช็คอิน + เช็คเอาท์แล้ว
    if (checkInTime && checkOutTime) {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              ✅ บันทึกเวลาครบแล้ว!
            </p>
            <p className="text-xs text-green-600">
              เข้างาน {checkInTime} · ออกงาน {checkOutTime}
            </p>
          </div>
        </div>
      );
    }

    // ⚠️ เช็คอินแล้ว แต่ยังไม่ได้เช็คเอาท์ (หลัง 16:00)
    if (checkInTime && !checkOutTime && currentHour >= 17) {
      return (
        <div className="flex animate-pulse items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 sm:p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-800">
              ⚠️ อย่าลืมกดออกงาน!
            </p>
            <p className="text-xs text-orange-600">
              คุณเข้างานเวลา {checkInTime} · ยังไม่ได้กดออกงาน
            </p>
          </div>
        </div>
      );
    }

    // 🔴 ยังไม่ได้เช็คอินเลย (หลัง 08:30)
    if (!checkInTime && currentHour >= 9) {
      return (
        <div className="flex animate-pulse items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">
              🔴 คุณยังไม่ได้เข้างานวันนี้!
            </p>
            <p className="text-xs text-red-600">
              กดปุ่ม "เข้างาน" ด้านล่างเพื่อบันทึกเวลา
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4 px-2 sm:space-y-6 sm:px-0">
      {/* 🔔 Banner เตือน */}
      {renderBanner()}

      {/* การ์ดแสดงรูปและข้อมูลพนักงาน */}
      <ProfileCard
        displayName={displayName}
        email={email}
        urlImage={profile.url_image}
        userName={userName}
        phoneNumber={profile.phone_number}
        position={profile.position}
      />

      {/* ปุ่ม Check-in / Check-out */}
      <CheckInOutButtons
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        loading={actionLoading}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
      />
    </div>
  );
};

export default HomePage;
