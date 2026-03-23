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

type Props = {
  onCreate?: (data: CreateAccount) => void;
};

export default function CreateEmployeeDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateAccount>({
    user_name: '',
    display_name: '',
    email: '',
    password: '',
    phone: '',
    position: '',
  } as CreateAccount);

  const handleChange = (k: keyof CreateAccount, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!form.user_name?.trim() || !form.password?.trim()) {
      // lightweight UX: use alert for mockup
      alert('กรุณากรอก User และรหัสผ่าน');
      return;
    }

    // Invoke callback (mock behaviour)
    onCreate?.(form);
    setOpen(false);
    setForm({
      user_name: '',
      display_name: '',
      email: '',
      password: '',
    } as CreateAccount);

    console.log('form', form);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-13 rounded-2xl">
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
                  <Label>Username</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      placeholder="user id"
                      value={form.user_name}
                      onChange={(e) =>
                        handleChange('user_name', e.target.value)
                      }
                    />
                  </div>
                </Field>

                <Field>
                  <Label>ชื่อ-แสดงผล</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      className="pl-10"
                      placeholder="ชื่อที่แสดง"
                      value={form.display_name}
                      onChange={(e) =>
                        handleChange('display_name', e.target.value)
                      }
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
              </FieldGroup>
            </div>
          </ScrollArea>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                ยกเลิก
              </Button>
            </DialogClose>
            <Button type="submit">สร้างพนักงาน</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
