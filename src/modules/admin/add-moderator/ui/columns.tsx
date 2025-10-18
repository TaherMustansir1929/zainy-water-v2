"use client";

import { ActionButton } from "@/modules/admin/add-moderator/ui/action-button";
import { Button } from "@/components/ui/button";
import { Area } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, SquareArrowOutUpRight } from "lucide-react";
import { GeneratedAvatar } from "@/lib/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useModeratorStore } from "@/lib/moderator-state";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Moderator = {
  id: string;
  name: string;
  password: string;
  areas: (typeof Area.enumValues)[number][];
  isWorking: boolean;
};

export const columns: ColumnDef<Moderator>[] = [
  {
    accessorKey: "serial_number",
    header: "S.No.",
    cell: ({ row }) => {
      return <div>{row.index + 1}.</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const setMod = useModeratorStore((state) => state.setModerator);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      return (
        <div className={"flex flex-row items-center gap-2 capitalize"}>
          <GeneratedAvatar seed={row.original.name} />
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant={"link"}
                className="text-black decoration-black cursor-pointer"
                onClick={() => {
                  setMod(row.original);
                  router.push("/moderator");
                }}
              >
                {row.original.name} <SquareArrowOutUpRight className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visit moderator&apos;s panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    accessorKey: "password",
    header: "Password",
  },
  {
    accessorKey: "areas",
    header: "Areas",
    cell: ({ row }) => {
      const areas = row.original.areas;
      return (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Areas</AccordionTrigger>
            <AccordionContent className="w-fit">
              <ul>
                {areas.map((area, index) => (
                  <li key={index} className="list-disc list-inside">
                    {area}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
  {
    accessorKey: "revenue",
    header: "Sales/Expenses",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data } = useQuery(
        orpc.admin.crudModerator.getSalesAndExpenses.queryOptions({
          input: row.original.name,
        })
      );
      return (
        <div>
          {data ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="font-mono">Sales:</div>
              <div>{data.sales}</div>
              <div className="font-mono">Expenses:</div>
              <div>{data.expenses}</div>
            </div>
          ) : (
            "Loading..."
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => {
      const isWorking = row.original.isWorking;
      return (
        <div
          className={`px-2 py-2 rounded-full text-xs text-center font-medium ${
            isWorking
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isWorking ? "Working" : "Removed"}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return <ActionButton row_data={row.original} />;
    },
    enableHiding: false,
  },
];
