
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArchiveRestore, Trash2 } from "lucide-react";

interface ArchivedAccountMenuProps {
  onUnarchive: () => void;
  onDelete: () => void;
}

export function ArchivedAccountMenu({ onUnarchive, onDelete }: ArchivedAccountMenuProps) {
  return (
    <DropdownMenuContent align="end" className="w-[200px] bg-background border z-50">
      <DropdownMenuItem onClick={onUnarchive} className="cursor-pointer">
        <ArchiveRestore className="mr-2 h-4 w-4 text-[#10B981]" />
        Unarchive
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDelete} className="cursor-pointer">
        <Trash2 className="mr-2 h-4 w-4 text-[#ea384c]" />
        Delete Permanently
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
