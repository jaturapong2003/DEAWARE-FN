import React from 'react';
import ProfileCard from '@/components/ProfileCard';
import CheckInOutButtons from '@/components/CheckInOutButtons';
import { useEmployee } from '@/hooks/useEmployee';
import { useAttendance } from '@/hooks/useAttendance';
import { useToast } from '@/components/Toast';
import { Loader2 } from 'lucide-react';

/**
 * หน้าหลัก - แสดงรูปและปุ่มบันทึกเวลาเข้า-ออกงาน
 */
const HomePage: React.FC = () => {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useEmployee();
  const {
    checkIn,
    checkOut,
    loading: actionLoading,
    isCheckedIn,
    checkInTime,
    checkOutTime,
  } = useAttendance();
  const toast = useToast();

  // แสดง Loading
  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  // แสดง Error
  if (profileError || !profile) {
    return (
      <div className="rounded-lg bg-red-100 p-6 text-center text-red-700">
        <p>❌ {profileError || 'ไม่สามารถโหลดข้อมูลได้'}</p>
      </div>
    );
  }

  // Handler สำหรับปุ่ม Check-in
  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success('เข้างานสำเร็จ!');
    } catch {
      toast.error('เข้างานไม่สำเร็จ');
    }
  };

  // Handler สำหรับปุ่ม Check-out
  const handleCheckOut = async () => {
    try {
      await checkOut();
      toast.success('ออกงานสำเร็จ!');
    } catch {
      toast.error('ออกงานไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      {/* การ์ดแสดงรูปและข้อมูลพนักงาน */}
      <ProfileCard
        displayName={profile.display_name}
        email={profile.email}
        urlImage={profile.url_image}
        userName={profile.user_name}
        phoneNumber={profile.phone_number}
        position={profile.position}
      />

      {/* ปุ่ม Check-in / Check-out พร้อมแสดงเวลา */}
      <CheckInOutButtons
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        loading={actionLoading}
        isCheckedIn={isCheckedIn}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
      />
    </div>
  );
};

export default HomePage;
