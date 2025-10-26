// src/components/CoaSelect.tsx
import React, { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useAccountCOA } from "@/hooks/useAccountCOA";

export interface CoaOption {
  id?: string;
  account_code?: string;
  name?: string;
  label?: string;
  [key: string]: any;
}

interface CoaSelectProps {
  valueId?: string | null;
  valueLabel?: string | null;
  onSelect: (id: string, label: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CoaSelect: React.FC<CoaSelectProps> = ({
  valueId,
  valueLabel,
  onSelect,
  placeholder = "Select account",
  disabled = false,
}) => {
  const { data: coaData, loading } = useAccountCOA();
  const [query, setQuery] = useState("");

  const options: CoaOption[] = useMemo(() => {
    return (coaData ?? []).map((c) => ({
      ...c,
      label: `${c.account_code ? c.account_code + " - " : ""}${c.name ?? ""}`,
    }));
  }, [coaData]);

  const filtered = options.filter((o) =>
    `${o.label}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          disabled={disabled}
        >
          {valueLabel || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[360px]">
        <Command>
          <CommandInput
            placeholder="Search account..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No results found."}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.label || ""}
                  onSelect={() => {
                    onSelect(
                      String(opt.id ?? opt.account_code ?? opt.label),
                      opt.label ?? ""
                    );
                  }}
                >
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
