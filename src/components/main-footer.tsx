import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export const MainFooter = ({ className }: Props) => {
  return (
    <footer className={cn("", className)}>
      Neotech &trade; &bull; All Rights Reserved &copy; 2025
    </footer>
  );
};
