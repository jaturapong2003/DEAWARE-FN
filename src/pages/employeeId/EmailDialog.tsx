import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';
import LoadingPage from '@/components/common/LoadingPage';
import { fetchWithAuth } from '@/config/fetctWithAuth';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Types for email
interface SendEmailRequest {
  subject: string;
  details: string;
  emailType: 'normal' | 'warning';
}

interface SendEmailResponse {
  success: boolean;
  message: string;
}
// Email Dialog
export default function EmaillDialog({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [emailType, setEmailType] = useState<'normal' | 'warning'>('normal');

  // Mutation for sending email
  const sendEmailMutation = useMutation<
    SendEmailResponse,
    Error,
    SendEmailRequest
  >({
    mutationFn: async (emailData) => {
      return await fetchWithAuth<SendEmailResponse>(
        `/api/employee/email/${employeeId}`,
        {
          method: 'POST',
          body: JSON.stringify(emailData),
        }
      );
    },
    onSuccess: (data) => {
      toast.success(data.message || 'ส่งอีเมลสำเร็จ');
      // รีเซ็ตฟอร์มและปิด dialog
      setSubject('');
      setDetails('');
      setEmailType('normal');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    },
  });

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบข้อมูล
    if (!subject.trim() || !details.trim()) {
      toast.error('กรุณากรอกหัวข้อและรายละเอียด');
      return;
    }

    // ส่งข้อมูลผ่าน mutation
    sendEmailMutation.mutate({
      subject: subject.trim(),
      details: details.trim(),
      emailType: emailType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'outline'}  className='cursor-pointer h-12 w-12'>
          <Mail className='size-7' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        {sendEmailMutation.isPending ? (
          <LoadingPage message="กำลังส่งอีเมล..." fullScreen={false} />
        ) : (
          <form onSubmit={handleSubmitEmail}>
            <DialogHeader>
              <DialogTitle>ฟอร์มส่งอีเมลให้พนักงาน</DialogTitle>
            </DialogHeader>
            <FieldGroup className="mt-5">
              <Field>
                <Label>หัวข้อ</Label>
                <Input
                  placeholder="กรอกหัวข้อที่นี่"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field>
              <Field>
                <Label>รายละเอียด</Label>
                <Textarea
                  placeholder="กรอกรายละเอียดที่นี่"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </Field>
              <Field>
                <Label>ประเภทจดหมาย</Label>
                <RadioGroup
                  value={emailType}
                  onValueChange={(value) =>
                    setEmailType(value as 'normal' | 'warning')
                  }
                >
                  <Field orientation={'horizontal'}>
                    <RadioGroupItem id="normal" value="normal" />
                    <Label htmlFor="normal">จดหมายทั่วไป</Label>
                  </Field>
                  <Field orientation={'horizontal'}>
                    <RadioGroupItem id="warning" value="warning" />
                    <Label htmlFor="warning">จดหมายแจ้งเตือน</Label>
                  </Field>
                </RadioGroup>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button
                  variant={'outline'}
                  type="button"
                  disabled={sendEmailMutation.isPending}
                >
                  ยกเลิก
                </Button>
              </DialogClose>
              <Button type="submit" disabled={sendEmailMutation.isPending}>
                {sendEmailMutation.isPending ? 'กำลังส่ง...' : 'ส่งอีเมล'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
