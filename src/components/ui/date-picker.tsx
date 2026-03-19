import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Selecione uma data", 
  disabled = false 
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      // Inicializar sem problemas de timezone
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    return undefined;
  });

  React.useEffect(() => {
    if (value) {
      // Criar data sem problemas de timezone
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        setDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
      }
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onChange) {
      // Converter para formato ISO (YYYY-MM-DD) sem problemas de timezone
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;
      onChange(isoDate);
    } else if (!selectedDate && onChange) {
      onChange('');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={ptBR}
          toYear={new Date().getFullYear()}
          fromYear={1950}
          captionLayout="dropdown-buttons"
          showOutsideDays={false}
          numberOfMonths={1}
          defaultMonth={date || new Date(1990, 0)}
        />
      </PopoverContent>
    </Popover>
  );
}
