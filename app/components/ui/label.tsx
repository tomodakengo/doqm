import { forwardRef } from "react";

export interface LabelProps
	extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
	({ className, ...props }, ref) => {
		return (
			<label
				className={`block text-sm font-medium text-gray-700 ${className || ""}`}
				ref={ref}
				{...props}
			/>
		);
	},
);
