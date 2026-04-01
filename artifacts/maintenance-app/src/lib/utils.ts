import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined | null) {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: es });
  } catch (e) {
    return dateString;
  }
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En Proceso",
  resolved: "Resuelto",
  cancelled: "Cancelado",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

export const ROLE_LABELS: Record<string, string> = {
  reporter: "Reportador",
  technician: "Técnico",
  admin: "Administrador",
};
