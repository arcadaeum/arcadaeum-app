import { Eye, EyeOff } from "lucide-react";
import type { PasswordFieldProps } from "@/types/auth";

function PasswordField({
	label,
	value,
	showPassword,
	onChange,
	onToggleMouseDown,
	onToggleMouseUp,
	onToggleMouseLeave,
	required = false,
	inputId = "password",
	placeholder,
}: PasswordFieldProps) {
	return (
		<div>
			<label htmlFor={inputId} className="block text-arcade-white font-kilimanjaro mb-2">
				{label}
			</label>
			<div className="relative">
				<input
					id={inputId}
					type={showPassword ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className="w-full px-4 py-2 pr-10 bg-arcade-white text-arcade-black font-kilimanjaro rounded border border-arcade-blue/50 focus:border-arcade-blue focus:outline-none"
					required={required}
				/>

				<button
					type="button"
					onMouseDown={onToggleMouseDown}
					onMouseUp={onToggleMouseUp}
					onMouseLeave={onToggleMouseLeave}
					aria-label={showPassword ? "Hide password" : "Show password"}
					className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-arcade-black/60 hover:text-arcade-black"
				>
					{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
				</button>
			</div>
		</div>
	);
}

export default PasswordField;
