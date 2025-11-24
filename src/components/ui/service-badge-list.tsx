import { Badge } from "./badge";

interface Service {
    id?: string;
    name: string;
}

interface ServiceBadgeListProps {
    serviceIds: string[];
    services: Service[];
    maxDisplay?: number;
    className?: string;
}

export function ServiceBadgeList({
    serviceIds,
    services,
    maxDisplay = 2,
    className = "",
}: ServiceBadgeListProps) {
    if (!serviceIds || serviceIds.length === 0) {
        return <span className="text-sm text-muted-foreground">All Services</span>;
    }

    const matchedServices = services.filter((s) => s.id && serviceIds.includes(s.id));
    const displayServices = matchedServices.slice(0, maxDisplay);
    const remainingCount = matchedServices.length - maxDisplay;
    const remainingNames = matchedServices.slice(maxDisplay).map(s => s.name).join(", ");

    if (matchedServices.length === 0) {
        return <span className="text-sm text-muted-foreground">{serviceIds.length} service(s)</span>;
    }

    return (
        <div className={`flex flex-wrap gap-1 ${className}`}>
            {displayServices.map((service) => (
                <Badge
                    key={service.id}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                >
                    {service.name}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-300 cursor-help dark:bg-blue-900/40 dark:text-blue-300"
                    title={remainingNames}
                >
                    +{remainingCount} more
                </Badge>
            )}
        </div>
    );
}
