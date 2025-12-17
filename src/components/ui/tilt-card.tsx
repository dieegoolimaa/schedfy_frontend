import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    perspective?: number;
    maxRotation?: number;
    scale?: number;
}

export function TiltCard({
    children,
    className,
    perspective = 1000,
    maxRotation = 15,
    scale = 1.05,
    ...props
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxRotation; // Invert X axis for natural tilt
        const rotateY = ((x - centerX) / centerX) * maxRotation;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div
            className={cn("relative transition-all duration-200 ease-out", className)}
            style={{ perspective: `${perspective}px` }}
            {...props}
        >
            <div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full transition-transform duration-200 ease-out will-change-transform"
                style={{
                    transform: isHovered
                        ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${scale}, ${scale}, ${scale})`
                        : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                }}
            >
                {children}
            </div>
        </div>
    );
}
