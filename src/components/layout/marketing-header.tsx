import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function MarketingHeader() {
    const { t } = useTranslation("common");

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Schedfy</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                                {t("nav.signIn", "Sign In")}
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm">
                                {t("nav.getStarted", "Get Started")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
