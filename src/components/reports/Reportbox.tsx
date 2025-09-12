// components/ReportBox.tsx
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

interface ReportBoxProps {
    icon: LucideIcon;
    title: string;
    description: string;
    buttonText: string;
    iconColor: string;
    buttonColor: string;
    link: string; // New prop for the link
}

export const ReportBox = ({
    icon: Icon,
    title,
    description,
    buttonText,
    iconColor,
    buttonColor,
    link, // Destructure the link prop
}: ReportBoxProps) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Icon className={`w-6 h-6 mr-2 ${iconColor}`} />
            {title}
            </h2>
            {/* Use Link to navigate to the specified page */}
            <Link to={link}>
            <button
                className={`${buttonColor} text-white px-4 py-2 rounded-lg hover:${buttonColor.replace("500", "600")} transition-colors`}
            >
                {buttonText}
            </button>
            </Link>
        </div>
        <p className="text-muted-foreground">{description}</p>
        </div>
    );
};