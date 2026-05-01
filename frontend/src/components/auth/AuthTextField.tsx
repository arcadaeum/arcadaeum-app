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
	fontClass,
}: AuthTextFieldProps) {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};

	const labelClass = `block text-arcade-white mb-2 ${fontClass ?? "font-kilimanjaro"}`;
	const inputClass = `w-full px-4 py-2 bg-arcade-white text-arcade-black rounded border border-arcade-blue/50 focus:border-arcade-blue focus:outline-none ${fontClass ?? "font-kilimanjaro"}`;

	return (
		<div>
			<label htmlFor={inputId} className={labelClass}>
				{label}
			</label>
			<input
				id={inputId}
				type={type}
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				autoComplete={autoComplete}
				className={inputClass}
				required={required}
			/>
		</div>
	);
}

export default AuthTextField;
