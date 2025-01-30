import { useEffect, useState } from "react";

export const useWindowSize = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setIsMobile(windowWidth < 576);
    }, [windowWidth]);

    return { windowWidth, isMobile };
};
