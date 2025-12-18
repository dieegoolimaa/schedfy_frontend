import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>{t("unauthorized.title", "Access Denied")}</CardTitle>
          <CardDescription>
            {t("unauthorized.description", "You don't have permission to access this page. Please contact your administrator if you believe this is an error.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                {t("unauthorized.goHome", "Go to Home")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="#" onClick={() => globalThis.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("unauthorized.goBack", "Go Back")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
