import { forwardRef } from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type || "text"}
				className={`w-full px-3 py-2 border border-gray-300 rounded-lg 
					focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
					${className || ""}`}
				ref={ref}
				{...props}
			/>
		);
	},
);
