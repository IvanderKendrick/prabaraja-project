    // components/ui/NeracaFilter.tsx
    import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
    import { DatePickerComponent } from "@/components/ui/date-picker";

    interface NeracaFilterProps {
    filter: string;
    onFilterChange: (value: string) => void;
    onDateChange: (start: Date | null, end: Date | null) => void;
    }

    export const NeracaFilter = ({ filter, onFilterChange, onDateChange }: NeracaFilterProps) => {
    return (
        <div className="flex flex-wrap items-center gap-4">
        {/* Filter Dropdown */}
        <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Filter" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
        </Select>

        {/* Date Picker for Custom Filter */}
        {filter === "custom" && (
            <div className="mt-4">
            <DatePickerComponent
                onDateChange={onDateChange}
                size="default" // You can change this to "sm" or "lg" as needed
                className="mt-2" // Additional custom class
            />
            </div>
        )}
        </div>
    );
    };