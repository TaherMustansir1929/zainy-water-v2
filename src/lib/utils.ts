import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dev_emails = [
  "aliasgharm184@gmail.com",
  "taher.mustansir5253@gmail.com",
];
