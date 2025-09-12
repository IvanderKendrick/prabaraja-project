    import React from "react";
    import { Search } from "lucide-react";
    import { Input } from "@/components/ui/input";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

    interface WarehouseFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedWarehouseLocation: string;
    setSelectedWarehouseLocation: (location: string) => void;
    warehouseLocations: string[];
    }

    export const WarehouseFilters: React.FC<WarehouseFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    selectedWarehouseLocation,
    setSelectedWarehouseLocation,
    warehouseLocations,
    }) => {
    return (
        <div className="flex gap-4 flex-1">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
            placeholder="Search warehouses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            />
        </div>
        <Select value={selectedWarehouseLocation} onValueChange={setSelectedWarehouseLocation}>
            <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
            {warehouseLocations.map((location) => (
                <SelectItem key={location} value={location}>
                {location}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
        </div>
    );
    };