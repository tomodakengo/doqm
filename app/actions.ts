"use server";

import {
	createTestCase,
	createTestSuite,
	deleteTestCase,
	deleteTestSuite,
	executeTestCase,
	getTestCaseVersion,
	getTestCaseVersions,
	getTestCases,
	getTestSuiteChildren,
	getTestSuites,
	updateTestCase,
	updateTestSuite,
} from "@/lib/api/supabase";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
	const email = formData.get("email")?.toString();
	const password = formData.get("password")?.toString();
	const supabase = await createClient();
	const origin = (await headers()).get("origin");

	if (!email || !password) {
		return encodedRedirect(
			"error",
			"/sign-up",
			"Email and password are required",
		);
	}

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
		},
	});

	if (error) {
		console.error(`${error.code} ${error.message}`);
		return encodedRedirect("error", "/sign-up", error.message);
	}
	return encodedRedirect(
		"success",
		"/sign-in",
		"Thanks for signing up! Please check your email for a verification link.",
	);
};

export const signInAction = async (formData: FormData) => {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return encodedRedirect("error", "/sign-in", error.message);
	}

	return redirect("/test-suites");
};

export const forgotPasswordAction = async (formData: FormData) => {
	const email = formData.get("email")?.toString();
	const supabase = await createClient();
	const origin = (await headers()).get("origin");
	const callbackUrl = formData.get("callbackUrl")?.toString();

	if (!email) {
		return encodedRedirect("error", "/forgot-password", "Email is required");
	}

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
	});

	if (error) {
		console.error(error.message);
		return encodedRedirect(
			"error",
			"/forgot-password",
			"Could not reset password",
		);
	}

	if (callbackUrl) {
		return redirect(callbackUrl);
	}

	return encodedRedirect(
		"success",
		"/forgot-password",
		"Check your email for a link to reset your password.",
	);
};

export const resetPasswordAction = async (formData: FormData) => {
	const supabase = await createClient();

	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	if (!password || !confirmPassword) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Password and confirm password are required",
		);
	}

	if (password !== confirmPassword) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Passwords do not match",
		);
	}

	const { error } = await supabase.auth.updateUser({
		password: password,
	});

	if (error) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Password update failed",
		);
	}

	encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
	const supabase = await createClient();
	await supabase.auth.signOut();
	return redirect("/sign-in");
};

/**
 * テストケースのバージョン履歴を取得する
 */
export async function getTestCaseVersionHistory(testCaseId: string) {
	try {
		const versions = await getTestCaseVersions(testCaseId);
		return { success: true, data: versions };
	} catch (error) {
		console.error("テストケースのバージョン履歴取得エラー:", error);
		return {
			success: false,
			error: "テストケースのバージョン履歴の取得中にエラーが発生しました",
		};
	}
}

/**
 * テストケースの特定バージョンを取得する
 */
export async function getSpecificTestCaseVersion(versionId: string) {
	try {
		const version = await getTestCaseVersion(versionId);
		return { success: true, data: version };
	} catch (error) {
		console.error("テストケースバージョンの取得エラー:", error);
		return {
			success: false,
			error: "テストケースバージョンの取得中にエラーが発生しました",
		};
	}
}
