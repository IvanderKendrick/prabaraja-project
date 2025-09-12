import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatInputCurrency = (value: string): string => {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, "");

  // Add thousand separators
  const formattedValue = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return formattedValue;
};

export const parseInputCurrency = (formattedValue: string): number => {
  // Remove all non-digit characters
  const digitsOnly = formattedValue.replace(/\D/g, "");

  // Convert to a number
  return parseInt(digitsOnly, 10);
};