import type { ChangeEvent } from "react";
import type { AuthTextFieldProps } from "@/types/auth";

function AuthTextField({
	label,
	value,
	onChange,
	type = "text",
	required = false,
	inputId = "auth-text-field",
	placeholder,
	autoComplete,
}: AuthTextFieldProps) {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};

	return (
		<div>
			<label htmlFor={inputId} className="block text-arcade-white font-kilimanjaro mb-2">
				{label}
			</label>
			<input
				id={inputId}
				type={type}
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				autoComplete={autoComplete}
				className="w-full px-4 py-2 bg-arcade-white text-arcade-black font-kilimanjaro rounded border border-arcade-blue/50 focus:border-arcade-blue focus:outline-none"
				required={required}
			/>
		</div>
	);
}

export default AuthTextField;
