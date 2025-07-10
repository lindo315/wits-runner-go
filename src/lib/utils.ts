import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get runner base fee from configuration
export async function getRunnerBaseFee(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'runner_base_fee')
      .single()

    if (error) {
      console.warn('Could not fetch runner base fee from config, using default:', error)
      return 10.00 // Default fallback
    }

    return parseFloat(data.value as string) || 10.00
  } catch (err) {
    console.warn('Error fetching runner base fee:', err)
    return 10.00 // Default fallback
  }
}
