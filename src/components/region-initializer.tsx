import { useEffect, useState } from "react";
import { useRegion } from "../contexts/region-context";
import { Loader2 } from "lucide-react";

interface RegionInitializerProps {
  children: React.ReactNode;
}

/**
 * Initializes region detection before rendering the app
 * Shows a loading screen while detecting user's location
 */
export function RegionInitializer({
  children,
}: Readonly<RegionInitializerProps>) {
  const { isDetecting } = useRegion();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for minimum 500ms even if detection is fast
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while detecting region
  if (isDetecting || showSplash) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20"></div>
            <Loader2 className="absolute inset-0 m-auto h-16 w-16 animate-spin text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Schedfy</h2>
            <p className="text-sm text-muted-foreground">
              Detecting your region...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
