
import { Switch } from "@/components/ui/switch";
import { CreateAccountDialog } from "@/components/bank/CreateAccountDialog";

interface BankHeaderProps {
  showArchived: boolean;
  setShowArchived: (value: boolean) => void;
  onCreateAccount: (formData: any) => void;
}

export function BankHeader({ showArchived, setShowArchived, onCreateAccount }: BankHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <CreateAccountDialog onSubmit={onCreateAccount} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show archived accounts</span>
        <Switch
          checked={showArchived}
          onCheckedChange={setShowArchived}
        />
      </div>
    </div>
  );
}
