import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { bookings as allBookings, dayNames, isSameDay, monthNames, type Booking } from "./bookings";

export function BookingsCalendar({
  bookings = allBookings,
  selectedDate,
  onSelectDate,
  compact = false,
}: {
  bookings?: Booking[];
  selectedDate: Date | null;
  onSelectDate: (d: Date | null) => void;
  compact?: boolean;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="size-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="size-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground py-1">
            {d.slice(0, compact ? 1 : 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dayNum, i) => {
          if (dayNum === null) return <div key={`e-${i}`} className={compact ? "h-10" : "h-16 sm:h-20"} />;
          const date = new Date(year, month, dayNum);
          const dayBookings = bookings.filter((b) => isSameDay(b.date, date));
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : date)}
              className={cn(
                "rounded-lg border p-1 sm:p-1.5 text-left transition flex flex-col",
                compact ? "h-10" : "h-16 sm:h-20",
                isSelected
                  ? "border-primary bg-primary/10"
                  : dayBookings.length
                    ? "border-border bg-muted/40 hover:border-primary/50"
                    : "border-transparent hover:bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium grid place-items-center size-5 rounded-full shrink-0",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                {dayNum}
              </span>
              {dayBookings.length > 0 &&
                (compact ? (
                  <span className="mt-auto flex items-center gap-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <span key={b.id} className="size-1.5 rounded-full bg-primary" />
                    ))}
                  </span>
                ) : (
                  <span className="mt-1 space-y-0.5 overflow-hidden">
                    {dayBookings.slice(0, 2).map((b) => (
                      <span
                        key={b.id}
                        className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {b.time} {b.customer.split(" ")[0]}
                      </span>
                    ))}
                    {dayBookings.length > 2 && (
                      <span className="block text-[10px] text-muted-foreground">+{dayBookings.length - 2} more</span>
                    )}
                  </span>
                ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
