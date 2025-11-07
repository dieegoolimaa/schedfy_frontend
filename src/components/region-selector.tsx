import { Globe } from "lucide-react";
import { useRegion } from "../contexts/region-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function RegionSelector() {
  const { region, availableRegions, setRegion } = useRegion();

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion as "PT" | "BR" | "US");
    // Force page reload to apply pricing changes
    globalThis.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{region}</span>
          <span className="text-lg">
            {availableRegions.find((r) => r.code === region)?.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableRegions.map((r) => (
          <DropdownMenuItem
            key={r.code}
            onClick={() => handleRegionChange(r.code)}
            className={region === r.code ? "bg-accent" : ""}
          >
            <span className="text-lg mr-2">{r.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{r.country}</span>
              <span className="text-xs text-muted-foreground">
                {r.currencySymbol} {r.currency}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
