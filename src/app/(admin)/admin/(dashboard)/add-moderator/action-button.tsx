import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAddModDrawer } from "@/lib/ui-states/add-moderator-drawer";
import { Ellipsis, SquarePen, Trash2, UserX } from "lucide-react";
import { Moderator } from "./columns";
import { useDeleteModerator } from "@/queries/admin/useDeleteModerator";
import { useConfirm } from "@/hooks/use-confirm";
import { useChangeModWorkStatus } from "@/queries/admin/useChangeModWorkStatus";
import { cn } from "@/lib/utils";

export const ActionButton = ({ row_data }: { row_data: Moderator }) => {
  const { openEditDrawer, setModData } = useAddModDrawer();

  const [DeleteConfirmDialog, delete_confirm] = useConfirm(
    "Are you sure you want to delete this moderator?",
    "All the deliveries and expenses associated with this moderator will also be deleted."
  );

  const [WorkStatusConfirmDialog, work_status_confirm] = useConfirm(
    `Are you sure you want to ${
      row_data.isWorking ? "remove" : "restore"
    } this moderator?`,
    `${
      row_data.isWorking
        ? "This moderator wont be able to work anymore, but their data will remain in the system."
        : "This moderator will be able to work again."
    }`
  );

  const deleteMutation = useDeleteModerator();
  const workStatusMutation = useChangeModWorkStatus();

  const handleEdit = () => {
    setModData(row_data);
    openEditDrawer();
  };

  const handleDelete = async () => {
    const ok = await delete_confirm();
    if (!ok) return;

    // Call the delete mutation
    await deleteMutation.mutateAsync({ name: row_data.name });
  };

  const handleStatusChange = async () => {
    const ok = await work_status_confirm();
    if (!ok) return;

    // Call the work status mutation
    await workStatusMutation.mutateAsync({
      name: row_data.name,
      isWorking: row_data.isWorking ?? true,
    });
  };

  return (
    <div>
      <DeleteConfirmDialog />
      <WorkStatusConfirmDialog />
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 rounded-md hover:bg-gray-100">
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleEdit}>
            <SquarePen className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleStatusChange}>
            <UserX
              className={cn(
                row_data.isWorking
                  ? "size-4 text-yellow-600"
                  : "size-4 text-green-600"
              )}
            />
            {row_data.isWorking ? (
              <span className="text-yellow-600">Remove Worker</span>
            ) : (
              <span className="text-green-600">Restore Worker</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="size-4 text-rose-500" />
            <span className="text-rose-500">Delete</span>
            <span className="text-xs font-mono text-muted-foreground">
              (Danger)
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
