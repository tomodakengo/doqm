"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getTeamDetails(teamId: string, tenantId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: team, error } = await supabase
        .from("teams")
        .select(`
      *,
      team_members(
        id,
        user_id,
        role,
        created_at,
        users(
          id,
          email,
          user_metadata,
          created_at
        )
      )
    `)
        .eq("id", teamId)
        .eq("tenant_id", tenantId)
        .single();

    if (error) {
        console.error("Error fetching team details:", error);
        return { team: null, error: error.message };
    }

    return { team, error: null };
}

export async function addTeamMember(teamId: string, tenantId: string, userId: string, role: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("team_members")
        .insert([
            {
                team_id: teamId,
                user_id: userId,
                role: role,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Error adding team member:", error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantId}/team/${teamId}`);
    return { success: true, data };
}

export async function removeTeamMember(teamId: string, tenantId: string, userId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);

    if (error) {
        console.error("Error removing team member:", error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantId}/team/${teamId}`);
    return { success: true };
} 