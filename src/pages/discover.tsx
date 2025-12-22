import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, ArrowRight, Loader2 } from "lucide-react";
import { Navigation } from "../components/layout/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { TiltCard } from "../components/ui/tilt-card";
import { searchService } from "../services/search.service";

interface DiscoverBusiness {
    _id: string;
    name: string;
    description?: string;
    businessType?: string;
    logo?: string;
    banner?: string;
    region?: string;
    city?: string;
    publicProfile: {
        slug: string;
        enabled: boolean;
    };
}

export function DiscoverPage() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [businesses, setBusinesses] = useState<DiscoverBusiness[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            try {
                // Determine query: matches name, businessType, city, description
                const results = await searchService.searchEntities(searchQuery);
                setBusinesses(results);
            } catch (err) {
                console.error("Failed to fetch businesses", err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchBusinesses, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navigation />

            {/* Search Header */}
            <section className="bg-muted/30 py-12 px-4 border-b">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold">
                            {t("discover.title", "Discover Local Businesses")}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {t("discover.subtitle", "Find the best professionals near you")}
                        </p>
                    </div>

                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder={t("discover.searchPlaceholder", "Search for services or businesses (e.g. 'Haircut', 'Yoga')")}
                            className="pl-10 py-6 text-lg shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center gap-2">
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            onClick={() => setViewMode("list")}
                            size="sm"
                        >
                            List View
                        </Button>
                        <Button
                            variant={viewMode === "map" ? "default" : "outline"}
                            onClick={() => setViewMode("map")}
                            size="sm"
                        >
                            Map View
                        </Button>
                    </div>
                </div>
            </section>

            {/* Content */}
            <main className="flex-1 bg-background py-12 px-4">
                <div className="max-w-7xl mx-auto">

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : viewMode === "list" ? (
                        businesses.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {businesses.map((business) => (
                                    <TiltCard key={business._id} scale={1.02} perspective={1500}>
                                        <Link to={`/book/${business.publicProfile?.slug || business._id}`} className="block h-full">
                                            <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow border-muted">
                                                <div className="h-48 bg-muted relative">
                                                    {business.banner || business.logo ? (
                                                        <img
                                                            src={business.banner || business.logo}
                                                            alt={business.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                                            <span className="text-4xl font-bold opacity-25">{business.name.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                    <Badge className="absolute top-4 right-4 bg-background/90 text-foreground backdrop-blur-sm">
                                                        {business.businessType || 'Business'}
                                                    </Badge>
                                                </div>
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-xl">{business.name}</CardTitle>
                                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                                <MapPin className="h-4 w-4 mr-1" />
                                                                {business.city ? `${business.city}, ${business.region}` : 'Location Available'}
                                                            </div>
                                                        </div>
                                                        {/* Placeholder for Rating as logic is not yet implemented in searchPublic */}
                                                        {/* <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold dark:bg-yellow-900/30 dark:text-yellow-500">
                                                            <Star className="h-3 w-3 mr-1 fill-current" />
                                                            5.0
                                                        </div> */}
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {business.description || "No description available."}
                                                    </p>
                                                    <div className="mt-4 pt-4 border-t flex items-center text-primary text-sm font-medium group">
                                                        {t("common.viewProfile", "View Profile")}
                                                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </TiltCard>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground text-lg">No businesses found matching your criteria.</p>
                            </div>
                        )
                    ) : (
                        <div className="h-[600px] bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="bg-muted p-4 rounded-full">
                                <MapPin className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">Map View Coming Soon</h3>
                            <p className="text-muted-foreground max-w-sm">
                                We are integrating with Google Maps to show businesses near you. Stay tuned!
                            </p>
                            <Button onClick={() => setViewMode("list")}>
                                Return to List
                            </Button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
