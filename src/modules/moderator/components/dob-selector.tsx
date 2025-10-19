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

export const DobSelector = () => {
  const { dob, setDOB } = useDOBStore();

  return (
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
          onSelect={(date) => setDOB(date || null)}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
};
