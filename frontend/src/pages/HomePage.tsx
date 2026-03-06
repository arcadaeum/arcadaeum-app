import NavigationBar from "../components/NavigationBar";
import ColorBends from '../components/ColorBends';
import RotatingText from '../components/RotatingText';
import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    return (
        <>
            <NavigationBar />

            {/* Full screen background */}
            <ColorBends
                className="fixed inset-0 -z-10 pointer-events-none"
                rotation={32}
                speed={0.2}
                scale={2}
                frequency={1}
                warpStrength={1}
                mouseInfluence={1}
                parallax={0.5}
                noise={0.1}
                transparent
                autoRotate={0}
            />

            {/* Centered content */}
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
                
                {/* Title row */}
                <div className="flex flex-row items-center gap-3 flex-wrap justify-center">
                    <span className="font-main text-white text-3xl sm:text-4xl md:text-5xl whitespace-nowrap
                 filter drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]">
                        Welcome to
                    </span>
                    <RotatingText
                        texts={['Arcadaeum', 'Your Library', 'Your Reviews']}
                        mainClassName="px-3 py-1 bg-arcade-gold text-black overflow-hidden justify-center rounded-lg font-main text-3xl sm:text-4xl md:text-5xl"
                        staggerFrom="last"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden pb-0.5"
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        rotationInterval={2000}
                    />
                </div>

                <p className="font-secondary font-bold text-gray-300 text-lg sm:text-base text-center max-w-md">
                    Track, review and discover games.
                </p>

                {/* Sign in button */}
                <button
                    onClick={() => navigate("/signin")}
                    className="mt-2 px-8 py-3 bg-grey text-white font-main text-lg rounded-lg hover:bg-arcade-orange transition-colors duration-200"
                >
                    Sign In
                </button>
            </div>
        </>
    );
}

export default HomePage;