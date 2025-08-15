"use client";

import { ActionButton } from "@/app/(admin)/admin/(dashboard)/add-moderator/action-button";
import { Button } from "@/components/ui/button";
import { Area } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { GeneratedAvatar } from "@/lib/avatar";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Moderator = {
  name: string;
  password: string;
  areas: Area[];
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
      return (
        <div className={"flex flex-row items-center gap-2"}>
          <GeneratedAvatar seed={row.original.name} />
          {row.original.name}
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
        <div className="flex flex-row gap-1">
          {areas.map((area, index) => (
            <div key={index}>{area}, </div>
          ))}
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
