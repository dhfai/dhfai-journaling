"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

type ViewState = "welcome" | "login" | "register";

export default function GetStartedPage() {
    const [currentView, setCurrentView] = useState<ViewState>("welcome");
    const [animatingButton, setAnimatingButton] = useState<"login" | "register" | null>(null);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const loginButtonRef = useRef<HTMLButtonElement>(null);
    const registerButtonRef = useRef<HTMLButtonElement>(null);

    const handleLoginClick = () => {
        if (loginButtonRef.current) {
            const rect = loginButtonRef.current.getBoundingClientRect();
            setButtonPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
        }
        setAnimatingButton("login");
        // Start view transition immediately
        setCurrentView("login");
        // Remove animation state after animation completes
        setTimeout(() => {
            setAnimatingButton(null);
        }, 700);
    };

    const handleRegisterClick = () => {
        if (registerButtonRef.current) {
            const rect = registerButtonRef.current.getBoundingClientRect();
            setButtonPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
        }
        setAnimatingButton("register");
        // Start view transition immediately
        setCurrentView("register");
        // Remove animation state after animation completes
        setTimeout(() => {
            setAnimatingButton(null);
        }, 700);
    };

    const handleBackToWelcome = () => {
        setCurrentView("welcome");
        setAnimatingButton(null);
    };

    const handleSwitchToLogin = () => {
        setCurrentView("login");
        setAnimatingButton(null);
    };

    const handleSwitchToRegister = () => {
        setCurrentView("register");
        setAnimatingButton(null);
    };

    return (
        <div className="min-h-screen bg-[#4E5173] overflow-x-hidden">
            {/* Full Container with Smooth Transitions */}
            <div className="min-h-screen flex flex-col md:flex-row transition-all duration-700 ease-in-out">

                {/* Left Side - Illustration (Always Present, Moves from Center to Left) */}
                <div
                    className={`flex items-center justify-center p-6 md:p-8 transition-all duration-700 ease-in-out ${
                        currentView === "welcome"
                            ? "w-full min-h-screen"
                            : "md:w-1/2 w-full bg-[#5a5e87]/50 backdrop-blur-sm min-h-[40vh] md:min-h-screen"
                    }`}
                >
                    <div className={`flex flex-col items-center justify-center text-center transition-all duration-700 w-full ${
                        currentView === "welcome" ? "space-y-8 md:space-y-12" : "space-y-4 md:space-y-8"
                    }`}>
                        {/* Illustration */}
                        <div className={`relative transition-all duration-700 ${
                            currentView === "welcome"
                                ? "w-full max-w-xs sm:max-w-md md:max-w-lg h-48 sm:h-64 md:h-80 mb-4 md:mb-6"
                                : "w-full max-w-[200px] md:max-w-sm lg:max-w-md h-32 md:h-48 lg:h-72"
                        }`}>
                            <Image
                                src="/team_illustration.png"
                                alt="Welcome illustration"
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>

                        {/* Welcome Text - Only visible on welcome screen */}
                        <div className={`space-y-3 md:space-y-4 transition-all duration-500 px-4 ${
                            currentView === "welcome"
                                ? "opacity-100 max-h-96"
                                : "opacity-0 max-h-0 overflow-hidden"
                        }`}>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl font-light">
                                Start your journaling journey today
                            </p>
                        </div>

                        {/* Buttons - Only visible on welcome screen */}
                        <div className={`flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center pt-2 md:pt-4 w-full max-w-md mx-auto px-6 sm:px-0 transition-all duration-300 ${
                            currentView === "welcome"
                                ? "opacity-100 max-h-96"
                                : "opacity-0 max-h-0 overflow-hidden pointer-events-none"
                        }`}>
                            <Button
                                ref={loginButtonRef}
                                size="lg"
                                onClick={handleLoginClick}
                                disabled={animatingButton !== null}
                                className={`bg-white text-gray-800 hover:bg-gray-100 font-semibold px-8 sm:px-10 md:px-12 py-5 md:py-6 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 w-full sm:w-auto ${
                                    animatingButton === "login" ? "invisible" : ""
                                }`}
                            >
                                Login
                            </Button>
                            <Button
                                ref={registerButtonRef}
                                size="lg"
                                onClick={handleRegisterClick}
                                disabled={animatingButton !== null}
                                className={`bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold px-8 sm:px-10 md:px-12 py-5 md:py-6 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-white/30 w-full sm:w-auto ${
                                    animatingButton === "register" ? "invisible" : ""
                                }`}
                            >
                                Register
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Forms (Slides in from Right on Desktop, Below Illustration on Mobile) */}
                <div
                    className={`flex items-center justify-center p-6 md:p-8 bg-[#3d4160]/60 backdrop-blur-md transition-all duration-700 ease-in-out ${
                        currentView === "welcome"
                            ? "w-0 opacity-0 overflow-hidden hidden"
                            : "w-full md:w-1/2 opacity-100 min-h-[60vh] md:min-h-screen"
                    }`}
                >
                    <div className={`w-full max-w-md transition-all duration-700 ${
                        currentView !== "welcome" ? "opacity-100" : "opacity-0"
                    }`}>
                        {currentView === "login" && (
                            <LoginForm
                                onBack={handleBackToWelcome}
                                onSwitchToRegister={handleSwitchToRegister}
                                showButton={!animatingButton}
                            />
                        )}

                        {currentView === "register" && (
                            <RegisterForm
                                onBack={handleBackToWelcome}
                                onSwitchToLogin={handleSwitchToLogin}
                                showButton={!animatingButton}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Animated Button Overlay - Only on Desktop */}
            {animatingButton && (
                <Button
                    size="lg"
                    className={`fixed font-semibold text-lg rounded-full shadow-lg transition-none z-50 pointer-events-none hidden md:block ${
                        animatingButton === "login"
                            ? "bg-white text-gray-800"
                            : "bg-white/10 text-white border border-white/30 backdrop-blur-sm"
                    }`}
                    style={{
                        top: `${buttonPosition.top}px`,
                        left: `${buttonPosition.left}px`,
                        width: `${buttonPosition.width}px`,
                        height: `${buttonPosition.height}px`,
                        animation: `moveToForm 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                    }}
                >
                    {animatingButton === "login" ? "Login" : "Register"}
                </Button>
            )}

            <style jsx>{`
                @keyframes moveToForm {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        top: calc(50vh + 10rem);
                        left: 75vw;
                        transform: translate(-50%, 0);
                        width: 28rem;
                        height: 3.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
