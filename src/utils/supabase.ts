import { createClient } from "@supabase/supabase-js"
import { Database } from "../types/supabase"

export const supabase = (SUPABASE_URL: string, SUPABASE_KEY: string) =>
    createClient<Database>(SUPABASE_URL, SUPABASE_KEY)
