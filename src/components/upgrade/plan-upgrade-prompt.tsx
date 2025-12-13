import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Lock, Sparkles, Check } from "lucide-react";
import { useRegion } from "@/contexts/region-context";

interface PlanUpgradePromptProps {
    currentPlan?: string;
    requiredPlan: string;
    feature: string;
    benefits?: string[];
}

/**
 * Component to show when user needs to upgrade plan
 */
export function PlanUpgradePrompt({
    currentPlan = 'individual',
    requiredPlan,
    feature,
    benefits = [],
}: PlanUpgradePromptProps) {
    const navigate = useNavigate();
    const { getPriceDisplay } = useRegion();

    const planInfo: Record<string, { label: string; color: string; price: string }> = {
        simple: {
            label: 'Simple',
            color: 'bg-blue-500',
            price: getPriceDisplay('simple', 'monthly') + '/month',
        },
        business: {
            label: 'Business',
            color: 'bg-green-500',
            price: getPriceDisplay('business', 'monthly') + '/month',
        },
    };

    const defaultBenefits = [
        'Unlimited team members',
        'Advanced reports',
        'Priority support',
        'Custom integrations',
    ];

    const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <Card className="max-w-2xl w-full">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Upgrade Required</CardTitle>
                        <CardDescription className="text-base mt-2">
                            <strong>{feature}</strong> is available on the{' '}
                            <Badge
                                className={`${planInfo[requiredPlan]?.color} text-white border-0`}
                            >
                                {planInfo[requiredPlan]?.label}
                            </Badge>{' '}
                            plan
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current vs Required Plan */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Current Plan</p>
                            <Badge variant="outline" className="text-lg px-4 py-2">
                                {currentPlan}
                            </Badge>
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Upgrade To</p>
                            <Badge
                                className={`${planInfo[requiredPlan]?.color} text-white text-lg px-4 py-2`}
                            >
                                {planInfo[requiredPlan]?.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">What you'll get:</h3>
                        </div>
                        <ul className="space-y-2">
                            {displayBenefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Price */}
                    {planInfo[requiredPlan]?.price && (
                        <div className="text-center py-4 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                            <p className="text-3xl font-bold">{planInfo[requiredPlan].price}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => navigate('/entity/subscription-management')}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
