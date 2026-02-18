import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  User,
  Building2,
  Phone,
  Clock,
  ScanFace,
} from 'lucide-react';
import { formatTime, formatDate } from '@/lib/date';
import { getInitials } from '@/lib/helper';

interface ProfileCardProps {
  displayName: string;
  email: string;
  urlImage: string;
  userName: string;
  phoneNumber?: string;
  position?: string;
  faceEmbeddingCount?: number;
  hasFaceEmbedding?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  displayName,
  email,
  urlImage,
  userName,
  phoneNumber,
  position,
  faceEmbeddingCount,
  hasFaceEmbedding,
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // อัพเดตเวลาทุกวินาที
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-card overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
      {/* Header พร้อมเวลา - Responsive */}
      <div className="from-primary/5 to-accent/5 flex flex-col gap-2 bg-linear-to-r via-transparent p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <h2 className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-lg font-bold text-transparent sm:text-xl">
          ข้อมูลพนักงาน
        </h2>
        <div className="text-muted-foreground flex items-center gap-2">
          <Clock className="text-primary/70 hidden h-4 w-4 sm:block" />
          <div className="text-left sm:text-right">
            <p className="text-foreground text-xl font-bold tabular-nums sm:text-2xl">
              {formatTime(currentTime.toISOString())}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDate(currentTime.toISOString())}
            </p>
          </div>
        </div>
      </div>
      <Separator />

      <div className="p-4 sm:p-6">
        {/* Mobile: ซ้อนแนวตั้ง, Desktop: แนวนอน */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
          {/* ส่วนรูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <div className="group relative">
              <div className="from-primary via-accent to-primary/50 absolute -inset-1 rounded-full bg-linear-to-r opacity-20 blur-md transition-opacity group-hover:opacity-30"></div>
              <Avatar className="border-primary/30 ring-primary/10 relative h-24 w-24 border-4 shadow-lg ring-2 sm:h-36 sm:w-36">
                <AvatarImage src={urlImage || undefined} alt={displayName} />
                <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-linear-to-br text-xl font-bold sm:text-3xl">
                  {getInitials(displayName || userName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-foreground mt-3 text-center text-base font-semibold sm:mt-4 sm:text-lg">
              {displayName}
            </h3>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 mt-1.5 text-xs font-medium"
            >
              {position || 'พนักงาน'}
            </Badge>
          </div>

          {/* ส่วนข้อมูลส่วนตัว */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <h4 className="text-foreground/90 text-base font-semibold sm:text-lg">
                ข้อมูลส่วนตัว
              </h4>
              <Separator className="bg-border/50" />
            </div>

            {/* Grid 1 คอลัมน์บน mobile, 2 คอลัมน์บน tablet+ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {/* ชื่อเต็ม */}
              <div className="group space-y-1.5">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <User className="text-primary/60 group-hover:text-primary h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
                  <span>ชื่อเต็ม</span>
                </div>
                <p className="text-foreground text-sm font-medium sm:text-base">
                  {displayName || '-'}
                </p>
              </div>

              {/* Username */}
              <div className="group space-y-1.5">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <Building2 className="text-accent/60 group-hover:text-accent h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
                  <span>ชื่อผู้ใช้</span>
                </div>
                <p className="text-foreground text-sm font-medium sm:text-base">
                  {userName || '-'}
                </p>
              </div>

              {/* Email */}
              <div className="group space-y-1.5">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <Mail className="text-chart-2/60 group-hover:text-chart-2 h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
                  <span>อีเมล</span>
                </div>
                <p className="text-foreground text-sm font-medium break-all sm:text-base">
                  {email || '-'}
                </p>
              </div>

              {/* เบอร์โทร */}
              <div className="group space-y-1.5">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <Phone className="text-chart-4/60 group-hover:text-chart-4 h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
                  <span>เบอร์โทร</span>
                </div>
                <p className="text-foreground text-sm font-medium sm:text-base">
                  {phoneNumber || '-'}
                </p>
              </div>

              {/* Face Embedding */}
              <div className="group space-y-1.5">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <ScanFace className="text-chart-1/60 group-hover:text-chart-1 h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4" />
                  <span>ข้อมูลใบหน้า</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-foreground text-sm font-medium sm:text-base">
                    {faceEmbeddingCount || 0} ภาพ
                  </p>
                  {hasFaceEmbedding && (
                    <Badge
                      variant="outline"
                      className="bg-chart-1/10 text-chart-1 border-chart-1/30 h-5 text-xs font-medium"
                    >
                      ลงทะเบียนแล้ว
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
