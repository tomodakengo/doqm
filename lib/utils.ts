import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function encodedRedirect(type: "error" | "success" | "warning", path: string, message: string) {
	const param = new URLSearchParams({ type, message });
	return redirect(`${path}?${param.toString()}`);
}

export async function getAuthSession() {
	const supabase = await createClient();
	return await supabase.auth.getSession();
}

export async function getCurrentUser() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	return user;
}
