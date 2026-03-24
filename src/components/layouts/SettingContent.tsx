import { useState, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useKeycloak } from '@react-keycloak/web';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth } from '@/config/fetctWithAuth';
import apiClient from '@/lib/apiClient';
import useAuthStore from '@/stores/authStore';
import toast from 'react-hot-toast';
import {
  ImageIcon,
  Settings,
  Sparkles,
  UploadCloud,
  User,
  X,
  Phone,
  Briefcase,
  UserRoundCog,
  Mail,
} from 'lucide-react';
import LoadingPage from '@/components/common/LoadingPage';
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
  const user = useAuthStore((state) => state.user);

  const [active, setActive] = useState<'profile' | 'ai' | 'update'>('profile');
  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [faceFiles, setFaceFiles] = useState<File[]>([]);
  const [faceEmbeddingCount, setFaceEmbeddingCount] = useState<number>(0);
  const keycloakProfile = keycloak?.profile as
    | {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
      }
    | undefined;

  const profileFirstName = keycloakProfile?.firstName || user?.firstName || '';
  const profileLastName = keycloakProfile?.lastName || user?.lastName || '';
  const profileEmail = keycloakProfile?.email || user?.email || '';

  const [phoneNumber, setPhoneNumber] = useState<string>(
    user?.phone_number || ''
  );
  const [position, setPosition] = useState<string>(user?.position || '');
  const [email, setEmail] = useState<string>(profileEmail);
  const [fname, setFname] = useState<string>(profileFirstName);
  const [lname, setLname] = useState<string>(profileLastName);

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const fetchProfile = async () => {
      setIsLoadingProfile(true);

      try {
        const response = await apiClient.get('/employee/me');
        if (isCancelled) return;

        const data = response.data as {
          fname?: string;
          lname?: string;
          phone_number?: string;
          position?: string;
          email?: string;
          face_embedding_count?: number;
        };

        setFname(data.fname || profileFirstName || '');
        setLname(data.lname || profileLastName || '');
        setPhoneNumber(data.phone_number || user?.phone_number || '');
        setPosition(data.position || user?.position || '');
        setEmail(data.email ?? profileEmail);
        setFaceEmbeddingCount(data.face_embedding_count ?? 0);
      } catch {
        toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        if (!isCancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isCancelled = true;
    };
  }, [
    open,
    profileEmail,
    profileFirstName,
    profileLastName,
    user?.phone_number,
    user?.position,
  ]);

  const clearProfile = () => setProfileFiles([]);
  const clearFace = () => setFaceFiles([]);

  const profilePreviews = useMemo(
    () => profileFiles.map((f) => URL.createObjectURL(f)),
    [profileFiles]
  );
  useEffect(() => {
    return () => {
      profilePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [profilePreviews]);

  const facePreviews = useMemo(
    () => faceFiles.map((f) => URL.createObjectURL(f)),
    [faceFiles]
  );
  useEffect(() => {
    return () => {
      facePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [facePreviews]);

  const uploadProfileImagesMutation = useMutation({
    mutationFn: async (): Promise<{ message?: string; url?: string }> => {
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

      return (await res.json()) as { message?: string; url?: string };
    },
    onSuccess: (data) => {
      setProfileFiles([]);
      toast.success(data?.message || 'อัปโหลดรูปโปรไฟล์สำเร็จ');

      apiClient.get('/employee/me').catch(() => {});
    },
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
    onSuccess: async (data) => {
      setFaceFiles([]);
      toast.success(data?.message || 'อัปโหลดรูปใบหน้าสำเร็จ');

      const response = await apiClient.get('/employee/me');
      const backendData = response.data as { face_embedding_count?: number };
      setFaceEmbeddingCount(backendData.face_embedding_count ?? 0);

      // no store updates needed, keep local state and keycloak-managed flow
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'อัปโหลดรูปใบหน้าล้มเหลว';
      toast.error(message);
    },
  });

  const clearFaceEmbeddingsMutation = useMutation({
    mutationFn: async (): Promise<{ message?: string }> => {
      await fetchWithAuth('/api/employee/face-embeddings', {
        method: 'DELETE',
      });
      return { message: 'ล้างรูปสำหรับ AI สำเร็จ' };
    },
    onSuccess: async (data) => {
      setFaceFiles([]);
      setFaceEmbeddingCount(0);
      toast.success(data?.message || 'ล้างรูปสำหรับ AI สำเร็จ');

      const response = await apiClient.get('/employee/me');
      const backendData = response.data as { face_embedding_count?: number };
      setFaceEmbeddingCount(backendData.face_embedding_count ?? 0);

      // update the store if available
      useAuthStore.getState().setAccountInfo(response.data);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'ล้างรูปสำหรับ AI ล้มเหลว';
      toast.error(message);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (): Promise<{ message?: string }> =>
      (await fetchWithAuth('/api/employee/update', {
        method: 'PATCH',
        body: JSON.stringify({
          fname,
          lname,
          email,
          phone_number: phoneNumber,
          position,
        }),
      })) as { message?: string },
    onSuccess: (data) => {
      toast.success(data?.message || 'อัปเดตข้อมูลโปรไฟล์สำเร็จ');

      apiClient
        .get('/employee/me')
        .then((resp) => {
          useAuthStore.getState().setAccountInfo(resp.data);
        })
        .catch(() => {});
    },
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
        ? uploadFaceImagesMutation.status === 'pending' ||
          clearFaceEmbeddingsMutation.status === 'pending'
        : updateProfileMutation.status === 'pending';

  const isProfileUploading = uploadProfileImagesMutation.status === 'pending';
  const isFaceUploading = uploadFaceImagesMutation.status === 'pending';
  const isFaceClearing = clearFaceEmbeddingsMutation.status === 'pending';
  const isProfileUpdating = updateProfileMutation.status === 'pending';
  const isAnyLoading =
    isLoadingProfile ||
    isProfileUploading ||
    isFaceUploading ||
    isFaceClearing ||
    isProfileUpdating;

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
    <div className="animate-in fade-in fixed inset-0 z-30 flex items-center justify-center p-4 duration-200 sm:p-6">
      <div
        className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!isAnyLoading) onClose();
        }}
      />

      <div className="bg-background relative z-30 mx-auto flex h-[85vh] w-full max-w-5xl scale-100 transform flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all sm:flex-row">
        {isAnyLoading && <LoadingPage message="กรุณารอสักครู่..." fullScreen />}

        <div className="shrink-0 border-b border-white/10 p-6 sm:w-72 sm:border-r sm:border-b-0">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Settings</h2>
            <button
              onClick={() => {
                if (!isAnyLoading) onClose();
              }}
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
                  onClick={() => {
                    if (!isAnyLoading) setActive(item.id);
                  }}
                  disabled={isAnyLoading}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-muted-foreground/10'
                      : 'hover:bg-muted-foreground/10'
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

        <div className="hide-scrollbar flex-1 overflow-y-auto p-6 sm:p-10">
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
                    <span className="bg-primary text-accent inline-flex items-center justify-center rounded-lg p-1.5">
                      <ImageIcon size={30} />
                    </span>
                    <CardTitle className="text-xs">
                      ลากไฟล์หรือคลิกเพื่อเลือก
                    </CardTitle>
                  </div>
                </CardHeader>

                {/* อัพเดทเวลาล่าสุดPremium Dropzone */}
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
                            {profilePreviews.slice(0, 3).map((url, i) => (
                              <div
                                key={i}
                                className="relative h-30 w-30 overflow-hidden rounded-md border-3 border-dashed p-0.5 shadow-inner"
                              >
                                {i === 2 && profileFiles.length > 3 ? (
                                  <div className="bg-primary flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                    {`+${profileFiles.length - 2}`}
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`preview-${i}`}
                                    className="h-full w-full rounded-sm object-cover"
                                  />
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
                            <span className="text-primary font-semibold">
                              คลิกเพื่อเลือก
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-6 flex justify-end px-0!">
                  <div className="flex gap-2">
                    {profileFiles.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => clearProfile()}
                        disabled={profileFiles.length === 0}
                        className="mr-2"
                      >
                        ล้างรูป
                      </Button>
                    )}

                    <Button
                      onClick={() => uploadProfileImagesMutation.mutate()}
                      disabled={isAnyLoading || profileFiles.length === 0}
                    >
                      {isPending ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปโปรไฟล์'}
                    </Button>
                  </div>
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
                  {/* อัพเดทเวลาล่าสุดPremium Dropzone (AI Variant using a different subtle color) */}
                  <div
                    className={`group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                      faceEmbeddingCount >= 10
                        ? 'border-red-500 bg-red-50/20'
                        : 'border-white/15 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={faceEmbeddingCount >= 10 || isAnyLoading}
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
                            {facePreviews.slice(0, 3).map((url, i) => (
                              <div
                                key={i}
                                className="relative h-30 w-30 overflow-hidden rounded-md border-2 border-dashed p-0.5 text-xs font-bold text-white shadow-lg"
                              >
                                {i === 2 && faceFiles.length > 3 ? (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-bold">
                                    {`+${faceFiles.length - 2}`}
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`face-preview-${i}`}
                                    className="h-full w-full rounded-md object-cover"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm font-semibold tracking-wide">
                            พร้อมให้ AI ประมวลผล {faceFiles.length} รูป
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
                            <span className="font-semibold text-indigo-400">
                              คลิกเพื่อเลือก
                            </span>
                          </p>
                        </>
                      )}
                      {faceEmbeddingCount >= 10 && (
                        <p className="text-xs text-red-500">
                          ระบบมีรูป AI แล้ว {faceEmbeddingCount} รูป (สูงสุด 10
                          รูป). กรุณาลบรูปเก่า ก่อนเพิ่มรูปใหม่
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-6 flex flex-col gap-2 px-0!">
                  <div className="flex w-full justify-between">
                    <Button
                      variant="secondary"
                      onClick={() => clearFaceEmbeddingsMutation.mutate()}
                      disabled={isAnyLoading}
                    >
                      {isFaceClearing ? 'กำลังล้าง...' : 'รีเช็ตรูป AI'}
                    </Button>
                    <div>
                      {faceFiles.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => clearFace()}
                          disabled={faceFiles.length === 0}
                          className="mr-2"
                        >
                          ล้างรูป
                        </Button>
                      )}

                      <Button
                        onClick={() => uploadFaceImagesMutation.mutate()}
                        disabled={
                          isAnyLoading ||
                          faceFiles.length === 0 ||
                          faceEmbeddingCount >= 10
                        }
                      >
                        {faceEmbeddingCount >= 10
                          ? 'จำนวนรูปเต็มแล้ว'
                          : isPending
                            ? 'กำลังส่งให้ AI...'
                            : 'อัปโหลดให้ AI'}
                      </Button>
                    </div>
                  </div>
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

              {isLoadingProfile ? (
                <LoadingPage message="กำลังโหลดข้อมูลผู้ใช้งาน..." fullScreen />
              ) : (
                <Card className="dark:text-foreground p-6 sm:p-8">
                  <CardContent className="p-0">
                    <div className="grid max-w-xl gap-6">
                      {/* Glassy Input: First name */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <UserRoundCog size={16} className="text-primary" />
                          ชื่อ
                        </Label>
                        <Input
                          value={fname}
                          onChange={(e) => setFname(e.target.value)}
                          placeholder="Somchai"
                        />
                      </div>

                      {/* Glassy Input: Last name */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <UserRoundCog size={16} className="text-primary" />
                          นามสกุล
                        </Label>
                        <Input
                          value={lname}
                          onChange={(e) => setLname(e.target.value)}
                          placeholder="Sukjai"
                        />
                      </div>

                      {/* Glassy Input 1 */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Mail size={16} className="text-primary" />
                          อีเมล
                        </Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>

                      {/* Glassy Input 2 */}
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

                      {/* Glassy Input 3 */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Briefcase size={14} className="text-primary" />{' '}
                          ตำแหน่ง
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
                      disabled={isAnyLoading}
                    >
                      {isAnyLoading
                        ? 'กำลังประมวลผล...'
                        : isPending
                          ? 'กำลังบันทึก...'
                          : 'บันทึกข้อมูล'}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
