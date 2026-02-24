import type { DateRange } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
import { Calendar as DatePicker } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

function DateRangeFilter({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterProps) {
  return (
    <div className="relative w-full md:w-auto">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>
              {dateRange?.from
                ? dateRange.to
                  ? `${dateRange.from.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} - ${dateRange.to.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`
                  : `${dateRange.from.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`
                : 'เลือกช่วงวันที่'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1">
          <DatePicker
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={1}
            disabled={(date: Date) =>
              date > new Date() || date < new Date('1900-01-01')
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateRangeFilter;
