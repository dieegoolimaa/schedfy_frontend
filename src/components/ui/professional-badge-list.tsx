import { Badge } from "./badge";

interface Professional {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
}

interface ProfessionalBadgeListProps {
    professionalIds: string[];
    professionals: Professional[];
    maxDisplay?: number;
    className?: string;
}

export function ProfessionalBadgeList({
    professionalIds,
    professionals,
    maxDisplay = 2,
    className = "",
}: ProfessionalBadgeListProps) {
    if (!professionalIds || professionalIds.length === 0) {
        return <span className="text-sm text-muted-foreground">All Professionals</span>;
    }

    const matchedProfessionals = professionals.filter((p) =>
        professionalIds.includes(p.id)
    );
    const displayProfessionals = matchedProfessionals.slice(0, maxDisplay);
    const remainingCount = matchedProfessionals.length - maxDisplay;

    const getProfessionalName = (prof: Professional) => {
        return prof.name || `${prof.firstName || ""} ${prof.lastName || ""}`.trim() || "Unknown";
    };

    const remainingNames = matchedProfessionals.slice(maxDisplay).map(p => getProfessionalName(p)).join(", ");

    if (matchedProfessionals.length === 0) {
        return (
            <span className="text-sm text-muted-foreground">
                {professionalIds.length} professional(s)
            </span>
        );
    }

    return (
        <div className={`flex flex-wrap gap-1 ${className}`}>
            {displayProfessionals.map((prof) => (
                <Badge
                    key={prof.id}
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800"
                >
                    {getProfessionalName(prof)}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 border-purple-300 cursor-help dark:bg-purple-900/40 dark:text-purple-300"
                    title={remainingNames}
                >
                    +{remainingCount} more
                </Badge>
            )}
        </div>
    );
}
