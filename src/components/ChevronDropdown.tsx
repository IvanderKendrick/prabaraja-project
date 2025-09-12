import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you're using a custom Button component

const ChevronDropdown = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility

  // Function to handle option clicks
  const handleOptionClick = (action) => {
    action(); // Execute the action passed in the options
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className="relative">
      {" "}
      {/* Parent container with relative positioning */}
      {/* Dropdown Button */}
      <Button
        className=" text-white bg-sidebar-active flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        Action <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={index}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleOptionClick(option.action)}
              >
                {option.icon && <span>{option.icon}</span>}{" "}
                {/* Display icon if provided */}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChevronDropdown;
