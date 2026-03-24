import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, User, Phone, Clock, ScanFace } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
    <Card className="border-border/60 bg-card gap-0 overflow-hidden py-0 transition-all hover:shadow-md">
      {/* Header - Responsive */}
      <CardHeader className="from-primary/5 to-accent/5 border-border/50 border-b bg-linear-to-r via-transparent p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-lg font-bold text-transparent sm:text-xl">
            ข้อมูลพนักงาน
          </CardTitle>
          <CardDescription className="sr-only">
            ข้อมูลส่วนตัวและสถานะใบหน้าของพนักงาน
          </CardDescription>
        </div>
        <div className="text-muted-foreground mt-2 flex items-center gap-2 sm:mt-0">
          <Clock className="text-primary/70 hidden h-4 w-4 sm:block" />
          <div className="text-left sm:text-right">
            <p className="text-foreground text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
              {formatTime(currentTime.toISOString())}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDate(currentTime.toISOString())}
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="bg-muted/10 p-4 sm:p-6">
        {/* Mobile: ซ้อนแนวตั้ง, Desktop: แนวนอน */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          {/* ส่วนรูปโปรไฟล์ */}
          <div className="flex min-w-50 flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer">
                  {/* Outer Glow Effect */}
                  <div className="from-primary via-accent to-primary/50 absolute -inset-1 rounded-full bg-linear-to-r opacity-20 blur-md transition-opacity duration-300 group-hover:opacity-40"></div>

                  <Avatar className="border-primary/30 ring-primary/10 relative h-24 w-24 border-4 shadow-lg ring-2 transition-transform duration-300 group-hover:scale-[1.02] sm:h-32 sm:w-32">
                    <AvatarImage
                      src={urlImage || undefined}
                      alt={displayName}
                    />
                    <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-linear-to-br text-2xl font-bold shadow-inner sm:text-4xl">
                      {getInitials(displayName || userName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">รูปโปรไฟล์เต็ม</DialogTitle>
                <DialogDescription className="sr-only">
                  รูปโปรไฟล์ขนาดเต็มของพนักงาน
                </DialogDescription>
                <img
                  src={urlImage || undefined}
                  alt={displayName}
                  className="h-auto w-full object-contain drop-shadow-2xl"
                />
              </DialogContent>
            </Dialog>

            <h3 className="text-foreground mt-4 text-center text-base font-semibold sm:text-lg">
              {displayName}
            </h3>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 mt-2 px-3 py-1 text-xs font-medium shadow-sm"
            >
              {position || 'พนักงาน'}
            </Badge>
          </div>

          {/* Vertical Divider for Desktop */}
          <div className="bg-border hidden h-48 w-px lg:block"></div>
          <div className="bg-border h-px w-full lg:hidden"></div>

          {/* ส่วนข้อมูลส่วนตัว */}
          <div className="w-full flex-1 space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <h4 className="text-foreground/90 flex items-center gap-2 text-base font-semibold sm:text-lg">
                รายละเอียดส่วนบุคคล
              </h4>
            </div>

            {/* Grid 1 คอลัมน์บน mobile, 2 คอลัมน์บน tablet+ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
              {/* ชื่อเต็ม (Primary) */}
              <div className="group hover:bg-accent/10 -m-2 cursor-default space-y-1.5 rounded-lg p-2 transition-colors hover:shadow-sm">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <div className="group-hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-md bg-transparent transition-all duration-200 group-hover:scale-110">
                    <User className="text-primary/60 group-hover:text-primary h-4 w-4 transition-colors duration-200" />
                  </div>
                  <span>ชื่อเต็ม</span>
                </div>
                <p className="text-foreground pl-9 text-sm font-medium sm:text-base">
                  {displayName || '-'}
                </p>
              </div>

              {/* Email (Chart-2) */}
              <div className="group hover:bg-accent/10 -m-2 cursor-default space-y-1.5 rounded-lg p-2 transition-colors hover:shadow-sm">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <div className="group-hover:bg-chart-2/10 flex h-7 w-7 items-center justify-center rounded-md bg-transparent transition-all duration-200 group-hover:scale-110">
                    <Mail className="text-chart-2/60 group-hover:text-chart-2 h-4 w-4 transition-colors duration-200" />
                  </div>
                  <span>อีเมล</span>
                </div>
                <p className="text-foreground pl-9 text-sm font-medium break-all sm:text-base">
                  {email || '-'}
                </p>
              </div>

              {/* เบอร์โทร (Chart-4) */}
              <div className="group hover:bg-accent/10 -m-2 cursor-default space-y-1.5 rounded-lg p-2 transition-colors hover:shadow-sm">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <div className="group-hover:bg-chart-4/10 flex h-7 w-7 items-center justify-center rounded-md bg-transparent transition-all duration-200 group-hover:scale-110">
                    <Phone className="text-chart-4/60 group-hover:text-chart-4 h-4 w-4 transition-colors duration-200" />
                  </div>
                  <span>เบอร์โทร</span>
                </div>
                <p className="text-foreground pl-9 text-sm font-medium sm:text-base">
                  {phoneNumber || '-'}
                </p>
              </div>

              {/* Face Embedding (Chart-1) */}
              <div className="group hover:bg-accent/10 -m-2 cursor-default space-y-1.5 rounded-lg p-2 transition-colors hover:shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium sm:text-sm">
                  <div className="group-hover:bg-chart-1/10 flex h-7 w-7 items-center justify-center rounded-md bg-transparent transition-all duration-200 group-hover:scale-110">
                    <ScanFace className="text-chart-1/60 group-hover:text-chart-1 h-4 w-4 transition-colors duration-200" />
                  </div>
                  <span>ข้อมูลใบหน้า</span>
                </div>
                <div className="flex items-center gap-3 pl-9">
                  <p className="text-foreground text-sm font-medium sm:text-base">
                    {faceEmbeddingCount || 0} ภาพ
                  </p>
                  {hasFaceEmbedding && (
                    <Badge
                      variant="outline"
                      className="bg-chart-1/10 text-chart-1 border-chart-1/30 h-6 px-2.5 text-xs font-medium shadow-sm"
                    >
                      <span className="bg-chart-1 mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full"></span>
                      ลงทะเบียนแล้ว
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
