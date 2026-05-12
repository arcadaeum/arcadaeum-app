type PageHeaderProps = {
	title: string;
	subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
	return (
		<>
			<h1 className="w-full mt-25 text-4xl font-title text-arcade-white border-b-4 border-arcade-white tracking-tighter max-sm:mt-10 max-sm:text-3xl max-sm:leading-tight">
				{title}
			</h1>
			<p className="mt-4 text-sm font-default text-gray-200 max-sm:leading-6">{subtitle}</p>
		</>
	);
}
