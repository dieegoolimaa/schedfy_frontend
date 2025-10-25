import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">
          {t("notFound.title", "Page Not Found")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t(
            "notFound.message",
            "The page you're looking for doesn't exist or has been moved."
          )}
        </p>
        <Button asChild>
          <Link to="/">{t("notFound.goHome", "Go Home")}</Link>
        </Button>
      </div>
    </div>
  );
}
