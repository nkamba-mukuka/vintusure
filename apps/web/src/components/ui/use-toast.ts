import { useToast as useToastOriginal } from "@/hooks/use-toast"

export type { ToastActionElement } from "@/components/ui/toast"
export type { ToastProps } from "@/components/ui/toast"

export function useToast() {
    return useToastOriginal()
} 