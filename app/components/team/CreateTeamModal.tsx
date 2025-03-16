import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { type FC, useState } from "react";

interface CreateTeamModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: { name: string; description: string }) => void;
}

const CreateTeamModal: FC<CreateTeamModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			setError("チーム名は必須です");
			return;
		}

		onSubmit({ name, description });
		setName("");
		setDescription("");
		setError("");
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white rounded-lg w-full max-w-md p-6 relative">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
				>
					<X className="w-5 h-5" />
				</button>

				<h2 className="text-xl font-semibold mb-6">新しいチームを作成</h2>

				{error && (
					<div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">チーム名</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="チーム名を入力"
						/>
					</div>

					<div>
						<Label htmlFor="description">説明（任意）</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="チームの説明を入力"
							rows={3}
						/>
					</div>

					<div className="flex justify-end space-x-3 pt-2">
						<Button type="button" onClick={onClose} variant="outline">
							キャンセル
						</Button>
						<Button type="submit">作成</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateTeamModal;
