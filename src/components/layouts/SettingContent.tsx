import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useKeycloak } from '@react-keycloak/web';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth } from '@/config/fetctWithAuth';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  ImageIcon,
  Settings,
  Sparkles,
  UploadCloud,
  User,
  X,
  Phone,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingContent({ open, onClose }: Props) {
  const { keycloak } = useKeycloak();
  const [active, setActive] = useState<'profile' | 'ai' | 'update'>('profile');
  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [faceFiles, setFaceFiles] = useState<File[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [position, setPosition] = useState<string>('');

  const uploadProfileImagesMutation = useMutation({
    mutationFn: async (): Promise<{ message?: string }> => {
      const formData = new FormData();
      profileFiles.forEach((file) => formData.append('image', file));

      const res = await fetch('/api/employee/profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keycloak?.token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`API Error: ${res.status} ${res.statusText} — ${body}`);
      }

      return (await res.json()) as { message?: string };
    },
    onSuccess: (data) =>
      toast.success(data?.message || 'อัปโหลดรูปโปรไฟล์สำเร็จ'),
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'อัปโหลดรูปโปรไฟล์ล้มเหลว';
      toast.error(message);
    },
  });

  const uploadFaceImagesMutation = useMutation({
    mutationFn: async (): Promise<{ message?: string }> => {
      const formData = new FormData();
      faceFiles.forEach((file) => formData.append('face_image', file));
      return (await fetchWithAuth('/api/employee/upload-face', {
        method: 'POST',
        body: formData,
      })) as { message?: string };
    },
    onSuccess: (data) =>
      toast.success(data?.message || 'อัปโหลดรูปใบหน้าสำเร็จ'),
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'อัปโหลดรูปใบหน้าล้มเหลว';
      toast.error(message);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (): Promise<{ message?: string }> =>
      (await fetchWithAuth('/api/employee/update', {
        method: 'PATCH',
        body: JSON.stringify({ phone_number: phoneNumber, position }),
      })) as { message?: string },
    onSuccess: (data) =>
      toast.success(data?.message || 'อัปเดตข้อมูลโปรไฟล์สำเร็จ'),
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'อัปเดตข้อมูลโปรไฟล์ล้มเหลว';
      toast.error(message);
    },
  });

  if (!open) return null;

  // derive a single pending flag based on active section's mutation
  const isPending =
    active === 'profile'
      ? uploadProfileImagesMutation.status === 'pending'
      : active === 'ai'
        ? uploadFaceImagesMutation.status === 'pending'
        : updateProfileMutation.status === 'pending';

  const navItems: {
    id: 'profile' | 'ai' | 'update';
    label: string;
    icon: LucideIcon;
  }[] = [
    { id: 'profile', label: 'อัพรูปโปรไฟล์', icon: User },
    { id: 'ai', label: 'อัพรูปสำหรับ AI', icon: Sparkles },
    { id: 'update', label: 'อัปเดตข้อมูลโปรไฟล์', icon: Settings },
  ];

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 sm:p-6">
      {/* 🌟 Backdrop แบบมีมิติ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* 📦 Modal Container (Glassmorphism Dark Mode) */}
      <div className="bg-background relative z-10 mx-auto flex h-[85vh] w-full max-w-5xl scale-100 transform flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all sm:flex-row">
        {/* 📑 Sidebar Navigation */}
        <div className="shrink-0 border-b border-white/10 p-6 sm:w-72 sm:border-r sm:border-b-0">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Settings</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="hide-scrollbar flex flex-row gap-2 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible sm:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Active Indicator (แถบสีแดงด้านซ้าย) */}
                  {isActive && (
                    <div className="absolute top-1/2 left-0 h-1/2 w-1 -translate-y-1/2 rounded-r-full bg-[#d1385c]" />
                  )}
                  <Icon
                    size={18}
                    className={isActive ? '' : 'group-hover:opacity-90'}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 📄 Main Content Area */}
        <div className="hide-scrollbar flex-1 overflow-y-auto p-6 sm:p-10">
          {/* --- SECTION 1: PROFILE UPLOAD --- */}
          {active === 'profile' && (
            <section className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">
                  อัพรูปโปรไฟล์
                </h2>
                <p className="mt-1 text-sm">
                  อัปโหลดรูปภาพเพื่อใช้แสดงผลบนโปรไฟล์ของคุณ
                </p>
              </div>

              <Card className="p-6 sm:p-8">
                <CardHeader className="px-0">
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                    <span className="inline-flex items-center justify-center rounded-lg p-1.5">
                      <ImageIcon size={16} />
                    </span>
                    <CardTitle className="text-xs">
                      ลากไฟล์หรือคลิกเพื่อเลือก
                    </CardTitle>
                  </div>
                </CardHeader>

                {/* ✨ Premium Dropzone */}
                <CardContent className="p-0">
                  <div className="group hover:border-primary/50 hover:bg-primary/5 relative overflow-hidden rounded-2xl border-2 border-dashed border-white/15 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setProfileFiles(
                          e.target.files ? Array.from(e.target.files) : []
                        )
                      }
                      className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="relative z-10 flex h-40 flex-col items-center justify-center gap-3">
                      {profileFiles.length > 0 ? (
                        <div className="animate-in zoom-in-95 flex flex-col items-center gap-3 duration-200">
                          <div className="flex -space-x-3">
                            {profileFiles.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className="bg-primary flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#0a0a0b] text-xs font-bold shadow-lg"
                              >
                                {i === 2 && profileFiles.length > 3 ? (
                                  `+${profileFiles.length - 2}`
                                ) : (
                                  <CheckCircle2 size={20} />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm font-semibold tracking-wide">
                            เตรียมอัปโหลด {profileFiles.length} รูป
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="rounded-full p-4 shadow-inner transition-colors group-hover:opacity-90">
                            <UploadCloud
                              size={28}
                              className="transition-colors"
                            />
                          </div>
                          <p className="text-sm">
                            ลากไฟล์มาวาง หรือ{' '}
                            <span className="font-semibold">
                              คลิกเพื่อเลือก
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-6 flex justify-end px-0!">
                  <Button
                    onClick={() => uploadProfileImagesMutation.mutate()}
                    disabled={isPending || profileFiles.length === 0}
                  >
                    {isPending ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปโปรไฟล์'}
                  </Button>
                </CardFooter>
              </Card>
            </section>
          )}

          {/* --- SECTION 2: AI UPLOAD --- */}
          {active === 'ai' && (
            <section className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">
                  อัพรูปสำหรับ AI
                </h2>
                <p className="mt-1 text-sm">
                  อัปโหลดรูปใบหน้าชัดเจน เพื่อให้ AI ประมวลผลได้แม่นยำ
                </p>
              </div>

              <Card className="p-6 sm:p-8">
                <CardHeader className="px-0">
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                    <span className="inline-flex items-center justify-center rounded-lg bg-indigo-500/20 p-1.5">
                      <Sparkles size={16} />
                    </span>
                    <CardTitle className="text-xs">
                      รูปภาพใบหน้าสำหรับ AI
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* ✨ Premium Dropzone (AI Variant using a different subtle color) */}
                  <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-white/15 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setFaceFiles(
                          e.target.files ? Array.from(e.target.files) : []
                        )
                      }
                      className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="relative z-10 flex h-40 flex-col items-center justify-center gap-3">
                      {faceFiles.length > 0 ? (
                        <div className="animate-in zoom-in-95 flex flex-col items-center gap-3 duration-200">
                          <div className="flex -space-x-3">
                            {faceFiles.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#0a0a0b] bg-indigo-500 text-xs font-bold text-white shadow-lg"
                              >
                                {i === 2 && faceFiles.length > 3 ? (
                                  `+${faceFiles.length - 2}`
                                ) : (
                                  <CheckCircle2 size={20} />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm font-semibold tracking-wide text-indigo-400">
                            พร้อมให้ AI ประมวลผล {faceFiles.length} รูป
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="rounded-full p-4 shadow-inner transition-colors group-hover:opacity-90">
                            <UploadCloud size={28} className="transition-colors" />
                          </div>
                          <p className="text-sm">
                            ลากไฟล์มาวาง หรือ{' '}
                            <span className="font-semibold text-indigo-400">
                              คลิกเพื่อเลือก
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-6 flex justify-end px-0!">
                  <Button
                    variant="secondary"
                    onClick={() => uploadFaceImagesMutation.mutate()}
                    disabled={isPending || faceFiles.length === 0}
                  >
                    {isPending ? 'กำลังส่งให้ AI...' : 'อัปโหลดให้ AI'}
                  </Button>
                </CardFooter>
              </Card>
            </section>
          )}

          {/* --- SECTION 3: UPDATE INFO --- */}
          {active === 'update' && (
            <section className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">
                  อัปเดตข้อมูลโปรไฟล์
                </h2>
                <p className="mt-1 text-sm">
                  จัดการข้อมูลส่วนตัวและการติดต่อของคุณ
                </p>
              </div>

              <Card className="p-6 sm:p-8">
                <CardContent className="p-0">
                  <div className="grid max-w-xl gap-6">
                    {/* Glassy Input 1 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Phone size={14} className="text-primary" />{' '}
                        เบอร์โทรศัพท์
                      </Label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                      />
                    </div>

                    {/* Glassy Input 2 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Briefcase size={14} className="text-primary" /> ตำแหน่ง
                      </Label>
                      <Input
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="เช่น Software Engineer"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-6 flex justify-end px-0!">
                  <Button
                    variant="default"
                    onClick={() => updateProfileMutation.mutate()}
                    disabled={isPending}
                  >
                    {isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </Button>
                </CardFooter>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
