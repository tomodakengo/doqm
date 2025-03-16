import { type ReactNode, useEffect, useRef } from "react";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-black/50"
				onClick={() => onOpenChange(false)}
			/>
			{children}
		</div>
	);
}

interface DialogContentProps {
	children: ReactNode;
	className?: string;
}

export function DialogContent({
	children,
	className = "",
}: DialogContentProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape" && ref.current) {
				const dialogElement = ref.current.closest('[role="dialog"]');
				if (dialogElement) {
					const closeFn = (dialogElement as any).__closeDialog;
					if (closeFn) closeFn();
				}
			}
		};

		document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, []);

	return (
		<div
			ref={ref}
			role="dialog"
			className={`relative bg-white rounded-lg shadow-lg max-w-lg mx-auto p-6 z-50 ${className}`}
			onClick={(e) => e.stopPropagation()}
		>
			{children}
		</div>
	);
}

interface DialogHeaderProps {
	children: ReactNode;
	className?: string;
}

export function DialogHeader({ children, className = "" }: DialogHeaderProps) {
	return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface DialogTitleProps {
	children: ReactNode;
	className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
	return (
		<h2 className={`text-xl font-semibold mb-1 ${className}`}>{children}</h2>
	);
}

interface DialogDescriptionProps {
	children: ReactNode;
	className?: string;
}

export function DialogDescription({
	children,
	className = "",
}: DialogDescriptionProps) {
	return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}
