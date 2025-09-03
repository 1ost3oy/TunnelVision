export const Logo = ({className}: {className?: string}) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      className={className}
    >
		<g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1">
			<path stroke="hsl(var(--primary))" d="M8 15S5 6.5 1 4c1 .2 3.3.5 4.5.5c1 .5 2.5 3 2.5 4c0-1 1.5-3.5 2.5-4A31 31 0 0 0 15 4c-4 2.5-7 11-7 11" />
			<path stroke="hsl(var(--secondary))" d="M3.4 2.6S5 1 7.7 1S12 2.6 12 2.6m-10.9 4S.5 8.7 2 11a6 6 0 0 0 3.4 3m4.6 0s2.2-.6 3.5-3c1.4-2.2.8-4.5.8-4.5" />
		</g>
    </svg>
);

export const AnimatedArrows = ({className}: {className?: string}) => (
    <div className={`relative ${className}`}>
        <style>
            {`
                .arrow-up { animation: bounce-up 2s ease-in-out infinite; }
                .arrow-down { animation: bounce-down 2s ease-in-out infinite; animation-delay: 1s; }
                @keyframes bounce-up {
                    0%, 100% { transform: translateY(0); opacity: 0.6; }
                    50% { transform: translateY(-5px); opacity: 1; }
                }
                @keyframes bounce-down {
                    0%, 100% { transform: translateY(0); opacity: 0.6; }
                    50% { transform: translateY(5px); opacity: 1; }
                }
            `}
        </style>
        <svg className="arrow-up absolute" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path stroke="#00d4e8" d="M25 43.75V6.25"/>
                <path stroke="#ff0de0" d="M31.25 12.5L25 6.25l-6.25 6.25"/>
            </g>
        </svg>
        <svg className="arrow-down absolute" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path stroke="#ff379c" d="M25 6.25v37.5"/>
                <path stroke="#00d4e8" d="M18.75 37.5L25 43.75l6.25-6.25"/>
            </g>
        </svg>
    </div>
);
