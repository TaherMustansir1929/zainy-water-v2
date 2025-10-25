import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDOBStore } from "@/lib/ui-states/date-of-bottle-usage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// Set your default timezone here
// const DEFAULT_TIMEZONE = "UTC"; // Karachi, Pakistan timezone

export const DobSelector = () => {
  const { dob, setDOB } = useDOBStore();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setDOB(null);
      return;
    }

    // Convert the selected date to the specified timezone at midnight
    const zonedDate = date;

    console.log(`Date selected: ${zonedDate}`);
  };

  return (
    <div className="grid grid-cols-1 justify-center items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant={"outline"}
            className={cn(
              !dob && "text-muted-foreground",
              "flex justify-center items-center mt-2 cursor-pointer"
            )}
          >
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            {dob ? format(dob, "PPP") : <span>Pick a date</span>}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dob || new Date()}
            onSelect={handleDateSelect}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>

      <pre className="md:text-xs text-[10px] text-gray-400">
        <code>{"</click>"}</code>
      </pre>
    </div>
  );
};
