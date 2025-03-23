import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "../types/supabase"

export const createOrgSupabase = async (
	name: string,
	userId: string,
	supabase: SupabaseClient<Database>
) => {
	const { data } = await supabase
		.from("organizations")
		.insert({
			name,
            image: "",
            type: "Organization"

		})
		.select()
	const orgId = data![0].id

	await supabase.from("user_organization").insert({
		org_id: orgId,
		user_id: userId,
		is_owner: 1,
        is_permission: "ALL"
	})
}

export const createPersonalOrgSupabase = async (
	name: string,
	userId: string,
	supabase: SupabaseClient<Database>
) => {
	const { data } = await supabase
		.from("organizations")
		.insert({
			name: `${name}'s Personal`,
            image: "",
            type: "Personal"

		})
		.select()
	const orgId = data![0].id

	await supabase.from("user_organization").insert({
		org_id: orgId,
		user_id: userId,
		is_owner: 1,
        is_permission: "ALL"
	})
}