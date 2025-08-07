import { Moderator } from "@/app/(admin)/admin/(dashboard)/add-moderator/columns";
import { create } from "zustand";

export type AddModDrawerState = {
  isEditOpen: boolean;
  isAddOpen: boolean;
  openEditDrawer: () => void;
  openAddDrawer: () => void;
  closeDrawer: () => void;
  mod_data: Moderator | null;
  setModData: (data: Moderator) => void;
};

export const useAddModDrawer = create<AddModDrawerState>((set) => ({
  isEditOpen: false,
  isAddOpen: false,
  openEditDrawer: () => set({ isEditOpen: true }),
  openAddDrawer: () => set({ isAddOpen: true }),
  closeDrawer: () => set({ isEditOpen: false, isAddOpen: false }),
  mod_data: null,
  setModData: (data: Moderator) => set({ mod_data: data }),
}));
