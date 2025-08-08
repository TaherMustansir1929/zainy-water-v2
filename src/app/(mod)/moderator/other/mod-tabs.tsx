import { ChartPie, CircleDollarSign, HeartHandshake } from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtherExpenseForm } from "./other-expense-form";
import { OtherExpenseTable } from "./other-expense-table";
import { BottleUsageForm } from "./bottle-usage-form";

const mod_tabs = [
  {
    value: "tab-1",
    label: "Expenses",
    icon: (
      <CircleDollarSign
        className="-ms-0.5 me-1.5 opacity-60"
        size={16}
        aria-hidden="true"
      />
    ),
  },
  {
    value: "tab-2",
    label: "Bottle Usage",
    icon: (
      <ChartPie
        className="-ms-0.5 me-1.5 opacity-60"
        size={16}
        aria-hidden="true"
      />
    ),
  },
  {
    value: "tab-3",
    label: "FOC",
    icon: (
      <HeartHandshake
        className="-ms-0.5 me-1.5 opacity-60"
        size={16}
        aria-hidden="true"
      />
    ),
  },
];

export function ModTabs() {
  return (
    <div className="w-full">
      <Tabs defaultValue="tab-1">
        <ScrollArea>
          <TabsList className="w-full flex bg-background mb-3 h-auto -space-x-px p-0 shadow-xs rtl:space-x-reverse">
            {mod_tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab.value}
                className={cn(
                  "data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e",
                  "flex-1 min-w-[150px]"
                )}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="tab-1">
          <div className="w-full flex flex-col md:items-center md:justify-center gap-y-6 p-2">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-primary font-bold text-center flex items-center justify-center gap-2">
                  <CircleDollarSign />
                  Other/ Bottle Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OtherExpenseForm />
              </CardContent>
            </Card>

            <OtherExpenseTable />
          </div>
        </TabsContent>
        <TabsContent value="tab-2">
          <div className="w-full flex flex-col md:items-center md:justify-center gap-y-6 p-2">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-primary font-bold text-center flex items-center justify-center gap-2">
                  <ChartPie />
                  Bottle Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BottleUsageForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tab-3">
          <p className="text-muted-foreground p-4 pt-1 text-center text-xs">
            Content for Tab 3
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
