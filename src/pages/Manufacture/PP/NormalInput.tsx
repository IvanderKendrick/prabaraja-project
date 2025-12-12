import { Input } from "@/components/ui/input";
import clsx from "clsx";

export default function NormalInput({ disabled, className, ...props }) {
  return (
    <Input
      {...props}
      disabled={disabled}
      className={clsx(
        className,
        disabled && "opacity-100 cursor-not-allowed bg-white text-black"
      )}
    />
  );
}
