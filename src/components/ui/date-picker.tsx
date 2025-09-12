    import * as React from "react";
    import DatePicker from "react-datepicker";
    import "react-datepicker/dist/react-datepicker.css";
    import { cva, type VariantProps } from "class-variance-authority";
    import { cn } from "@/lib/utils";

    // Define variants for the DatePicker
    const datePickerVariants = cva(
    "p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
    {
        variants: {
        size: {
            default: "w-[200px]",
            sm: "w-[150px]",
            lg: "w-[250px]",
        },
        },
        defaultVariants: {
        size: "default",
        },
    }
    );

    // Define props for the DatePicker
    export interface DatePickerProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof datePickerVariants> {
    onDateChange: (startDate: Date | null, endDate: Date | null) => void;
    }

    // DatePicker Component
    function DatePickerComponent({ className, size, onDateChange, ...props }: DatePickerProps) {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        onDateChange(date, endDate);
    };

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
        onDateChange(startDate, date);
    };

    return (
        <div className={cn("flex gap-4", className)} {...props}>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Select start date"
            className={cn(datePickerVariants({ size }))}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="Select end date"
            className={cn(datePickerVariants({ size }))}
            />
        </div>
        </div>
    );
    }

    export { DatePickerComponent, datePickerVariants };