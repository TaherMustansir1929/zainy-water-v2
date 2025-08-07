import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminState = {
  id: string;
  name: string;
};

type AdminStore = {
  admin: AdminState | null;
  setAdmin: (admin: AdminState | null) => void;
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      admin: null,
      setAdmin: (admin) => set({ admin }),
    }),
    {
      name: "admin-storage", // unique name for localStorage key
      partialize: (state) => ({ admin: state.admin }),
    }
  )
);
