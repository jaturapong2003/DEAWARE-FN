import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Building2, Phone, Briefcase, Clock } from 'lucide-react';

interface ProfileCardProps {
  displayName: string;
  email: string;
  urlImage: string;
  userName: string;
  phoneNumber?: string;
  position?: string;
}

/**
 * คอมโพเนนต์แสดงรูปและข้อมูลพนักงาน - Responsive
 */
const ProfileCard: React.FC<ProfileCardProps> = ({
  displayName,
  email,
  urlImage,
  userName,
  phoneNumber,
  position,
}) => {
  // State สำหรับแสดงเวลาปัจจุบัน
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // อัพเดตเวลาทุกวินาที
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format เวลาเป็นภาษาไทย
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // สร้างตัวอักษรย่อจากชื่อ
  const getInitials = (name: string | undefined | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      {/* Header พร้อมเวลา - Responsive */}
      <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <h2 className="text-lg font-bold sm:text-xl">ข้อมูลพนักงาน</h2>
        <div className="text-muted-foreground flex items-center gap-2">
          <Clock className="hidden h-4 w-4 sm:block" />
          <div className="text-left sm:text-right">
            <p className="text-foreground text-xl font-bold sm:text-2xl">
              {formatTime(currentTime)}
            </p>
            <p className="text-xs">{formatDate(currentTime)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Mobile: ซ้อนแนวตั้ง, Desktop: แนวนอน */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
          {/* ส่วนรูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="border-primary/20 h-24 w-24 border-4 sm:h-36 sm:w-36">
                <AvatarImage src={urlImage || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-3xl">
                  {getInitials(displayName || userName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="mt-3 text-center text-base font-semibold sm:mt-4 sm:text-lg">
              {displayName}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {position || 'พนักงาน'}
            </Badge>
          </div>

          {/* ส่วนข้อมูลส่วนตัว */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <h4 className="border-b pb-2 text-base font-semibold sm:text-lg">
              ข้อมูลส่วนตัว
            </h4>

            {/* Grid 1 คอลัมน์บน mobile, 2 คอลัมน์บน tablet+ */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {/* ชื่อเต็ม */}
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>ชื่อเต็ม</span>
                </div>
                <p className="text-sm font-medium sm:text-base">
                  {displayName || '-'}
                </p>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>ชื่อผู้ใช้</span>
                </div>
                <p className="text-sm font-medium sm:text-base">
                  {userName || '-'}
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>อีเมล</span>
                </div>
                <p className="text-sm font-medium break-all sm:text-base">
                  {email || '-'}
                </p>
              </div>

              {/* เบอร์โทร */}
              {phoneNumber && (
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>เบอร์โทร</span>
                  </div>
                  <p className="text-sm font-medium sm:text-base">
                    {phoneNumber}
                  </p>
                </div>
              )}

              {/* ตำแหน่ง */}
              {position && (
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>ตำแหน่ง</span>
                  </div>
                  <p className="text-sm font-medium sm:text-base">{position}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
