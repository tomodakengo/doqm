import { AlertTriangle } from "lucide-react";
import type { FC } from "react";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	type?: "danger" | "warning" | "info";
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "削除",
	cancelLabel = "キャンセル",
	type = "danger",
}) => {
	if (!isOpen) return null;

	const getTypeStyles = () => {
		switch (type) {
			case "danger":
				return {
					icon: "text-red-600",
					button: "bg-red-600 hover:bg-red-700",
				};
			case "warning":
				return {
					icon: "text-yellow-600",
					button: "bg-yellow-600 hover:bg-yellow-700",
				};
			default:
				return {
					icon: "text-blue-600",
					button: "bg-blue-600 hover:bg-blue-700",
				};
		}
	};

	const styles = getTypeStyles();

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-6 w-full max-w-md">
				<div className="flex items-center space-x-3 mb-6">
					<AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
					<h2 className="text-xl font-semibold text-gray-900">{title}</h2>
				</div>

				<p className="text-gray-600 mb-6">{message}</p>

				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={() => {
							onConfirm();
							onClose();
						}}
						className={`px-4 py-2 text-white rounded-lg ${styles.button}`}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDialog;
