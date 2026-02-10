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
 * คอมโพเนนต์แสดงรูปและข้อมูลพนักงาน - แบบ Employee Details
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
  const getInitials = (name: string) => {
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
      {/* Header พร้อมเวลา */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-bold">ข้อมูลพนักงาน</h2>
        <div className="text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <div className="text-right">
            <p className="text-foreground text-2xl font-bold">
              {formatTime(currentTime)}
            </p>
            <p className="text-xs">{formatDate(currentTime)}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* ส่วนรูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="border-primary/20 h-36 w-36 border-4">
                <AvatarImage
                  src={urlImage || undefined}
                  alt={displayName || userName || 'User'}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {getInitials(displayName || userName || '')}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="mt-4 text-center text-lg font-semibold">
              {displayName || userName || 'ผู้ใช้'}
            </h3>
            <Badge variant="secondary" className="mt-1">
              {position || 'พนักงาน'}
            </Badge>
          </div>

          {/* ส่วนข้อมูลส่วนตัว */}
          <div className="flex-1 space-y-4">
            <h4 className="border-b pb-2 text-lg font-semibold">
              ข้อมูลส่วนตัว
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* ชื่อเต็ม */}
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>ชื่อเต็ม</span>
                </div>
                <p className="font-medium">{displayName}</p>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>ชื่อผู้ใช้</span>
                </div>
                <p className="font-medium">{userName}</p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>อีเมล</span>
                </div>
                <p className="font-medium">{email}</p>
              </div>

              {/* เบอร์โทร */}
              {phoneNumber && (
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>เบอร์โทร</span>
                  </div>
                  <p className="font-medium">{phoneNumber}</p>
                </div>
              )}

              {/* ตำแหน่ง */}
              {position && (
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4" />
                    <span>ตำแหน่ง</span>
                  </div>
                  <p className="font-medium">{position}</p>
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
