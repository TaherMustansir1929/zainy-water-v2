"use client";

import { LoadingDotsPulse } from "@/components/loading-dots";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GeneratedAvatar } from "@/lib/avatar";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export const ChangeLogMainSection = () => {
  const commitsQuery = useQuery(
    orpc.admin.changelog.getGithubChanges.queryOptions()
  );

  if (commitsQuery.isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-6 py-10">
        <LoadingDotsPulse />
      </div>
    );
  }

  const commits = commitsQuery.data || [];

  return (
    <main className="w-full flex flex-col items-center justify-center gap-6 px-6 py-4">
      <h1 className="text-4xl font-bold font-mono">Developer Changelog</h1>
      {commits.map((commit) => (
        <Card className="min-w-2/3 border-primary/40" key={commit.id}>
          <CardHeader>
            <CardTitle className="text-2xl">
              <Tooltip>
                <TooltipTrigger className="text-left">
                  {commit.message.length > 50
                    ? `${commit.message.slice(0, 50)}...`
                    : commit.message}
                </TooltipTrigger>
                <TooltipContent className="w-[500px]">
                  <p>{commit.message}</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              <div className="flex flex-col gap-4">
                <p className="font-mono">{commit.id}</p>
                <p className="flex w-full justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="rounded-full border border-gray-500/50">
                      <GeneratedAvatar seed={commit.id} variant="identicon" />
                    </span>
                    {commit.author}
                  </div>
                  <span>{format(commit.date, "PPP")}</span>
                </p>
              </div>
            </CardDescription>
            <CardAction></CardAction>
          </CardHeader>
        </Card>
      ))}
    </main>
  );
};
