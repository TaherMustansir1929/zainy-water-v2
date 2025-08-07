"use client";

import { useAdminStore } from "@/lib/admin-state";
import { useEffect, useState } from "react";

type Props = {
  text: string;
  greeting?: string;
};

const qoutes_list = [
  "🤝 Salutations",
  "👀 Good to see you",
  "👋 Hey there",
  "🔙 Welcome back",
  "🤗 Nice to have you here",
  "😃 Glad you're here",
  "🥳 Happy to see you",
  "🎉 It's great to have you",
  "🌞 Hope you're having a great day",
  "🙏 Thanks for joining us",
  "💼 Wishing you a productive day",
  "🤩 Always a pleasure",
  "🌟 You're awesome",
  "🚀 Let's make today great",
  "🛠️ Ready to get started?",
  "🏆 Let's achieve great things together",
];

export const WelcomeSection = ({ text, greeting }: Props) => {
  const admin_store = useAdminStore((state) => state.admin);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [qoute, setQoute] = useState<string | null>(null);

  useEffect(() => {
    if (admin_store?.name) {
      setAdminName(admin_store.name);
    }
  }, [admin_store?.name]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * qoutes_list.length);
    setQoute(qoutes_list[randomIndex]);
  }, [adminName]);

  return (
    <div className="p-4 w-full max-w-7xl border-b">
      <div className="mb-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          {greeting ?? "Welcome"}, {adminName ?? "Admin"}!
        </h1>
        <h2 className="font-mono text-xl">
          {qoute ?? "👍 Let's get started!"}
        </h2>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-6">{text}</p>
    </div>
  );
};
