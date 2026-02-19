import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  page: number;
  totalPages: number;
  limit?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
};

function PaginationControll({
  page,
  totalPages,
  limit = 10,
  onPageChange,
  onLimitChange,
}: Props) {
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  const handleLimit = (value: string) => {
    const l = Number(value) || 10;
    onLimitChange?.(l);
  };

  return (
    <div className="mb-2 flex w-full items-center justify-between gap-3">
      <div className="ml-4 flex items-center gap-2">
        <label className="text-muted-foreground text-sm">รายการ/หน้า</label>
        <Select value={limit.toString()} onValueChange={handleLimit}>
          <SelectTrigger size="sm" className="w-17.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={page <= 1}
          className="cursor-pointer"
        >
          ก่อนหน้า
        </Button>
        <div className="text-sm">
          หน้าที่ {page} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={next}
          disabled={page >= totalPages}
          className="cursor-pointer"
        >
          ถัดไป
        </Button>
      </div>
    </div>
  );
}

export default PaginationControll;
