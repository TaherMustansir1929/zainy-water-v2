"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Props = {
  text: string;
  greeting?: string;
};

const quotes_list = [
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
  const { user, isLoaded } = useUser();
  const [adminName, setAdminName] = useState<string>("");
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    if (user?.firstName && user?.lastName) {
      setAdminName(`${user.firstName} ${user.lastName}`);
    }
  }, [isLoaded, user?.firstName, user?.lastName]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes_list.length);
    setQuote(quotes_list[randomIndex]);
  }, [user]);

  return (
    <div className="p-4 w-full max-w-7xl border-b">
      <div className="mb-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          {greeting ?? "Welcome"}, {isLoaded ? adminName : "Admin"}!
        </h1>
        <h2 className="font-mono text-xl">
          {quote ?? "👍 Let's get started!"}
        </h2>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-6">{text}</p>
    </div>
  );
};
