"use client";

import { getOtherExpensesByModeratorId } from "@/actions/moderator/mod-other-exp.action";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OtherExpense } from "@prisma/client";
import { useModeratorStore } from "@/lib/moderator-state";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const OtherExpenseTable = () => {
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const { moderator } = useModeratorStore();

  const fetchExpenses = async () => {
    setLoading(true);

    const expenseData = await getOtherExpensesByModeratorId(
      moderator?.id || "cmdwsek000000ijja4qqbsa8t"
    );

    setLoading(false);

    if (expenseData) {
      setExpenses(expenseData);
    } else {
      console.error("Failed to fetch expenses");
      toast.error("Failed to fetch expenses. Please try again.");
    }
  };

  return (
    <div>
      <div className="w-full flex justify-end mb-4">
        <Button variant={"outline"} onClick={fetchExpenses}>
          {expenses.length > 0 ? "Refresh" : "Show"} List
          {loading && <Loader2 className="animate-spin" />}
        </Button>
      </div>
      <div className="bg-background overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-9 py-2 min-w-[150px]">Date</TableHead>
              <TableHead className="h-9 py-2 min-w-[100px]">Amount</TableHead>
              <TableHead className="h-9 py-2 min-w-[150px]">
                Description
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="py-2 font-medium">
                  {format(expense.date, "PPP")}
                </TableCell>
                <TableCell className="py-2">{expense.amount}</TableCell>
                <TableCell className="py-2">{expense.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        List of other expenses added today.
      </p>
    </div>
  );
};
