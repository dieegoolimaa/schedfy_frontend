import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, KeyRound } from "lucide-react";

import { authService } from "../services/auth.service";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await authService.requestPasswordReset(data.email);

            // Toast notification as requested
            toast.success(
                t("auth.resetEmailSent", "Password reset email sent! Please check your inbox.")
            );

            setIsSuccess(true);
        } catch (error: any) {
            console.error("Forgot password error:", error);
            const message =
                error.response?.data?.message ||
                "Failed to send reset email. Please try again.";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md shadow-lg border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {isSuccess ? t("auth.checkEmail", "Check your email") : t("auth.forgotPassword", "Forgot password?")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSuccess
                            ? t("auth.resetLinkSent", "We have sent a password reset link to your email address.")
                            : t("auth.enterEmailReset", "Enter your email address and we'll send you a link to reset your password.")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate("/login")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t("auth.backToLogin", "Back to login")}
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t("auth.email", "Email")}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-10"
                                        {...register("email")}
                                        aria-invalid={errors.email ? "true" : "false"}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("common.sending", "Sending...")}
                                    </>
                                ) : (
                                    t("auth.sendResetLink", "Send Reset Link")
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!isSuccess && (
                    <CardFooter className="flex justify-center border-t p-4">
                        <Link
                            to="/login"
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t("auth.backToLogin", "Back to login")}
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
