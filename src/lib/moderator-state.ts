import { Area } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ModeratorState = {
  id: string;
  name: string;
  areas: Area[];
};

type ModeratorStore = {
  moderator: ModeratorState | null;
  setModerator: (moderator: ModeratorState | null) => void;
};

export const useModeratorStore = create<ModeratorStore>()(
  persist(
    (set) => ({
      moderator: null,
      setModerator: (moderator) => set({ moderator }),
    }),
    {
      name: "moderator-storage", // unique name for localStorage key
      partialize: (state) => ({ moderator: state.moderator }),
    }
  )
);
