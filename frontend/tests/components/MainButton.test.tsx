import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MainButton from "@/components/ui/MainButton";

describe("MainButton", () => {
	it("renders button with text", () => {
		render(<MainButton text="Click me" />);
		expect(screen.getByText("Click me")).toBeInTheDocument();
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("calls onClick when clicked", () => {
		const handleClick = vi.fn();
		render(<MainButton text="Click me" onClick={handleClick} />);
		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("can be disabled", () => {
		const handleClick = vi.fn();
		render(<MainButton text="Disabled" onClick={handleClick} disabled />);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("renders as link when navigateTo provided", () => {
		render(
			<BrowserRouter>
				<MainButton text="Go to browse" navigateTo="/browse" />
			</BrowserRouter>,
		);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/browse");
		expect(link).toHaveTextContent("Go to browse");
	});

	it("renders disabled link when both navigateTo and disabled", () => {
		render(
			<BrowserRouter>
				<MainButton text="Disabled link" navigateTo="/browse" disabled />
			</BrowserRouter>,
		);
		const span = screen.getByText("Disabled link").closest("span");
		expect(span).toBeInTheDocument();
		expect(span).toHaveAttribute("aria-disabled", "true");
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});
});
