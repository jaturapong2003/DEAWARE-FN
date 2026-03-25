import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldGroup } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, User, Mail, Phone, Briefcase, Key } from 'lucide-react';
import type { CreateAccount } from '@/@types/Account';
import toast from 'react-hot-toast';
import {
  mapCreateAccountToPayload,
  extractApiErrorMessage,
  useCreateEmployee,
} from '@/hooks/useEmployee';

type Props = {
  onCreate?: (data: CreateAccount) => void;
};

export default function CreateEmployeeDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateAccount>({
    username: '',
    fname: '',
    lname: '',
    email: '',
    password: '',
    phone: '',
    position: '',
  } as CreateAccount);
  const [confirmPassword, setConfirmPassword] = useState('');
  const { createEmployee, creatingEmployee } = useCreateEmployee();

  const handleChange = (k: keyof CreateAccount, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const resetForm = () => {
    setForm({
      fname: '',
      lname: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      position: '',
    } as CreateAccount);
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = form.username?.trim() ?? '';
    if (!username || !form.password?.trim()) {
      toast.error('กรุณากรอก User และรหัสผ่าน');
      return;
    }

    if (username.length < 3) {
      toast.error('Username ต้องมีอย่างน้อย 3 ตัวอักษร');
      return;
    }

    if (form.password.length < 6) {
      toast.error('รหัสผ่านต้องมากกว่า 6 ตัวอักษร');
      return;
    }

    if (form.password !== confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const payload = mapCreateAccountToPayload(form);
      await createEmployee(payload);
      toast.success('สร้างพนักงานสำเร็จ');
      onCreate?.(form);
      setOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error(err);
      toast.error(extractApiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex h-13 items-center gap-2 rounded-2xl"
        >
          <PlusCircle className="h-4 w-4" />
          สร้างพนักงาน
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>ฟอร์มสร้างพนักงานใหม่</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[55vh]">
            <div className="p-2">
              <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label>ชื่อ</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      placeholder="ชื่อ"
                      value={form.fname || ''}
                      onChange={(e) => handleChange('fname', e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <Label>นามสกุล</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      placeholder="นามสกุล"
                      value={form.lname || ''}
                      onChange={(e) => handleChange('lname', e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <Label>Username</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      placeholder="ชื่อเข้าใช้งานระบบ"
                      value={form.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <Label>อีเมล</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <Label>เบอร์โทร (ไม่บังคับ)</Label>
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      placeholder="081-xxx-xxxx"
                      value={form.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <Label>ตำแหน่ง</Label>
                  <div className="relative">
                    <Briefcase className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      placeholder="ตำแหน่งงาน"
                      value={form.position || ''}
                      onChange={(e) => handleChange('position', e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <Label>รหัสผ่าน</Label>
                  <div className="relative">
                    <Key className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      type="password"
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                    />
                  </div>
                </Field>
                <Field>
                  <Label>ยืนยันรหัสผ่าน</Label>
                  <div className="relative">
                    <Key className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      type="password"
                      placeholder="ยืนยันรหัสผ่าน"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </Field>
              </FieldGroup>
            </div>
          </ScrollArea>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                ยกเลิก
              </Button>
            </DialogClose>
            <Button type="submit" disabled={creatingEmployee}>
              สร้างพนักงาน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
