import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth } from '@/config/fetctWithAuth';
import { SettingsIcon, LogOutIcon, ImageIcon, UploadCloud } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import DEAWARE from '@/assets/deaware.webp';
import { navigationItems } from '@/lib/itemMenu';
import SettingModal from '../SettingHoverCard';
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"



const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { keycloak } = useKeycloak();
  const [openSetting, setOpenSetting] = useState(false);
  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [faceFiles, setFaceFiles] = useState<File[]>([]);
  const user = useAuthStore((state) => state.user);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');

  const updateProfileMutation = useMutation<{ message?: string }>({
    mutationFn: async () =>
      fetchWithAuth('/api/employee/update', {
        method: 'PATCH',
        body: JSON.stringify({ phone_number: phoneNumber, position: position }),
      }) as Promise<{ message?: string }>,
    onSuccess: (data : { message?: string }) => toast.success(data?.message || 'อัปเดตข้อมูลโปรไฟล์สำเร็จ'),
    onError: (error: Error) => toast.error(error?.message || 'อัปเดตข้อมูลโปรไฟล์ล้มเหลว'),
  });

  const uploadProfileImagesMutation = useMutation<{ message?: string }>({
    mutationFn: async (): Promise<{ message?: string }> => {
      const formData = new FormData();
      profileFiles.forEach((file) => formData.append('image', file));
      return fetch('/api/employee/profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: formData,
      
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          console.error(`[profile-image] ${res.status} ${res.statusText}`, body);
          throw new Error(`API Error: ${res.status} — ${body}`);
        }
        return res.json();
      });
    },
    onSuccess: (data : { message?: string }) => toast.success(data?.message || 'อัปโหลดรูปโปรไฟล์สำเร็จ'),
    onError: (error: Error) => toast.error(error?.message || 'อัปโหลดรูปโปรไฟล์ล้มเหลว'),
  });

  const uploadFaceImagesMutation = useMutation<{ message?: string }>({
    mutationFn: async (): Promise<{ message?: string }> => {
      const formData = new FormData();
      faceFiles.forEach((file) => formData.append('face_image', file));
      return fetchWithAuth('/api/employee/upload-face', {
        method: 'POST',
        body: formData,
      }) as Promise<{ message?: string }>;
    },
    onSuccess: (data : { message?: string }) => toast.success(data?.message || 'อัปโหลดรูปใบหน้าสำเร็จ'),
    onError: (error: Error) => toast.error(error?.message || 'อัปโหลดรูปใบหน้าล้มเหลว'),
  });
  




  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border from-sidebar/50 border-b bg-linear-to-b to-transparent">
        <div className="flex items-center justify-center py-3.25 group-data-[collapsible=icon]:hidden">
          <div className="relative">
            <div className="from-primary/10 via-accent/10 to-primary/10 absolute -inset-2 rounded-lg bg-linear-to-r opacity-50 blur-sm"></div>
            <img
              src={DEAWARE}
              alt="deaware logo"
              width={150}
              height={150}
              className="relative"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold">
            เมนูหลัก
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="group hover:bg-sidebar-accent/80 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 data-[active=true]:text-primary transition-all data-[active=true]:bg-linear-to-r data-[active=true]:shadow-sm"
                  >
                    <Link to={item.url}>
                      <item.icon className="transition-transform group-hover:scale-110" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold">
            ตั้งค่า
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Dialog>
                  <DialogTrigger asChild>
                    <SidebarMenuButton tooltip="Settings">
                      <SettingsIcon />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ตั้งค่า</DialogTitle>
                      <DialogDescription>
                        จัดการรูปภาพและข้อมูลโปรไฟล์ของคุณ
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="UploadProfileImages">
                      <TabsList variant="line">
                        <TabsTrigger value="UploadProfileImages">อัพโหลดรูปโปรไฟล์</TabsTrigger>
                        <TabsTrigger value="UploadFaceImages">อัพโหลดรูปใบหน้า</TabsTrigger>
                        <TabsTrigger value="UpdateProfileData">อัปเดตข้อมูลโปรไฟล์</TabsTrigger>
                      </TabsList>
                      <TabsContent value="UploadProfileImages">
                        <div className="grid gap-4 py-4">
                          <FieldGroup>
                            <Field>
                              <div className="space-y-3">
                                {/* Label: ปรับให้ดูเป็น Metadata ที่สะอาดขึ้น */}
                                <label className="text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
                                  <div className="bg-primary/10 rounded-md p-1">
                                    <ImageIcon size={14} className="text-primary" />
                                  </div>
                                  หลักฐานและรูปภาพ
                                </label>

                                {/* Dropzone Container */}
                                <div className="group border-border/40 bg-secondary/10 hover:border-primary/40 hover:bg-secondary/20 relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        setProfileFiles(Array.from(e.target.files));
                                      }
                                    }}
                                    className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                                  />

                                  {/* UI Display Overlay */}
                                  <div className="relative z-10 flex h-24 flex-col items-center justify-center gap-2 transition-transform duration-300 group-active:scale-95">
                                    {profileFiles.length > 0 ? (
                                      <>
                                        <div className="flex -space-x-2">
                                          {[...Array(Math.min(profileFiles.length, 3))].map((_, i) => (
                                            <div
                                              key={i}
                                              className="border-background bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-sm"
                                            >
                                              {i === 2 && profileFiles.length > 3 ? (
                                                `+${profileFiles.length - 2}`
                                              ) : (
                                                <ImageIcon size={12} />
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                        <p className="text-primary animate-in fade-in zoom-in-95 text-[11px] font-bold tracking-tight">
                                          เลือกแล้ว {profileFiles.length} รูปภาพ
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <div className="bg-background/50 group-hover:bg-primary/10 rounded-full p-2 shadow-inner transition-colors">
                                          <UploadCloud
                                            size={20}
                                            className="text-muted-foreground group-hover:text-primary transition-colors"
                                          />
                                        </div>
                                        <p className="text-muted-foreground text-[10px] font-medium tracking-wide">
                                          ลากไฟล์มาวาง หรือ{" "}
                                          <span className="text-primary font-bold">
                                            คลิกเพื่อเลือก
                                          </span>
                                        </p>
                                      </>
                                    )}
                                  </div>

                                  {/* Background Shine Effect (เพิ่มความหรู) */}
                                  <div className="from-primary/5 absolute inset-0 z-0 bg-linear-to-tr via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                              </div>
                            </Field>
                          </FieldGroup>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            disabled={uploadProfileImagesMutation.isPending || profileFiles.length === 0}
                            onClick={() => uploadProfileImagesMutation.mutate()}
                          >
                            {uploadProfileImagesMutation.isPending ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
                          </Button>
                        </DialogFooter>
                      </TabsContent>
                      <TabsContent value="UploadFaceImages">
                        <div className="grid gap-4 py-4">
                          <FieldGroup>
                            <Field>
                              <div className="space-y-3">
                                {/* Label: ปรับให้ดูเป็น Metadata ที่สะอาดขึ้น */}
                                <label className="text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
                                  <div className="bg-primary/10 rounded-md p-1">
                                    <ImageIcon size={14} className="text-primary" />
                                  </div>
                                  หลักฐานและรูปภาพ
                                </label>

                                {/* Dropzone Container */}
                                <div className="group border-border/40 bg-secondary/10 hover:border-primary/40 hover:bg-secondary/20 relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        setFaceFiles(Array.from(e.target.files));
                                      }
                                    }}
                                    className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                                  />

                                  {/* UI Display Overlay */}
                                  <div className="relative z-10 flex h-24 flex-col items-center justify-center gap-2 transition-transform duration-300 group-active:scale-95">
                                    {faceFiles.length > 0 ? (
                                      <>
                                        <div className="flex -space-x-2">
                                          {[...Array(Math.min(faceFiles.length, 3))].map((_, i) => (
                                            <div
                                              key={i}
                                              className="border-background bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-sm"
                                            >
                                              {i === 2 && faceFiles.length > 3 ? (
                                                `+${faceFiles.length - 2}`
                                              ) : (
                                                <ImageIcon size={12} />
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                        <p className="text-primary animate-in fade-in zoom-in-95 text-[11px] font-bold tracking-tight">
                                          เลือกแล้ว {faceFiles.length} รูปภาพ
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <div className="bg-background/50 group-hover:bg-primary/10 rounded-full p-2 shadow-inner transition-colors">
                                          <UploadCloud
                                            size={20}
                                            className="text-muted-foreground group-hover:text-primary transition-colors"
                                          />
                                        </div>
                                        <p className="text-muted-foreground text-[10px] font-medium tracking-wide">
                                          ลากไฟล์มาวาง หรือ{" "}
                                          <span className="text-primary font-bold">
                                            คลิกเพื่อเลือก
                                          </span>
                                        </p>
                                      </>
                                    )}
                                  </div>

                                  {/* Background Shine Effect (เพิ่มความหรู) */}
                                  <div className="from-primary/5 absolute inset-0 z-0 bg-linear-to-tr via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                              </div>
                            </Field>
                          </FieldGroup>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            disabled={uploadFaceImagesMutation.isPending || faceFiles.length === 0}
                            onClick={() => uploadFaceImagesMutation.mutate()}
                          >
                            {uploadFaceImagesMutation.isPending ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
                          </Button>
                        </DialogFooter>
                      </TabsContent>
                      <TabsContent value="UpdateProfileData">
                        <div className="grid gap-4 py-4">
                          <FieldGroup>
                            <Field>
                              <FieldLabel htmlFor="profile-phonenumber">เบอร์โทรศัพท์</FieldLabel>
                              <Input
                                id="profile-phonenumber"
                                type="text"
                                placeholder={user?.phone_number || "กรอกเบอร์โทรศัพท์ของคุณ"}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                              <FieldLabel htmlFor="profile-position">ตำแหน่ง</FieldLabel>
                              <Input
                                id="profile-position"
                                type="text"
                                placeholder={user?.position || "กรอกตำแหน่งของคุณ"}
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                              />
                            </Field>
                          </FieldGroup>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            disabled={updateProfileMutation.isPending}
                            onClick={() => updateProfileMutation.mutate()}
                          >
                            {updateProfileMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                          </Button>
                        </DialogFooter>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border from-sidebar/50 border-t bg-linear-to-t to-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                keycloak.logout({ redirectUri: window.location.origin });
              }}
              tooltip="Logout"
              className="group hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOutIcon className="transition-transform group-hover:scale-110" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <SettingModal
        open={openSetting}
        onClose={() => setOpenSetting(false)}
      />
    </Sidebar>
  );

};

export default AppSidebar;
