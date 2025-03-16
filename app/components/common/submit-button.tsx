"use client";

import type React from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
	children,
	pendingText,
	...props
}: {
	children: React.ReactNode;
	pendingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactNode {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
			{...props}
		>
			{pending ? (pendingText ?? "送信中...") : children}
		</button>
	);
}
