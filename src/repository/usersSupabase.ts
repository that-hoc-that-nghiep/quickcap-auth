import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "../types/supabase"
import { User } from "../controller/auth/dto"

export const createUserSupabase = async (
    user: User,
    userId: string,
    supabase: SupabaseClient<Database>
) => {
    console.log(user)
    return await supabase
        .from("users")
        .insert({
            id: userId,
            email: user.email,
            name: user.name,
            verified_email: 1,
            given_name: user.given_name,
            family_name: user.family_name,
            picture: user.picture,
            locale: "en",
            subscription: "FREE"
        })
        .select("*")
}