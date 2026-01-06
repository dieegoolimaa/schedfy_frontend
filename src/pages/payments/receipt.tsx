import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { paymentsService } from "../../services/payments.service";
import { Payment } from "../../types/models/payments.interface";
import { Loader2, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatPrice, formatDateLong } from "../../lib/region-config";

export function ReceiptPage() {
    const { t } = useTranslation("payments");
    const { id } = useParams<{ id: string }>();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [entity, setEntity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadPayment(id);
        }
    }, [id]);

    const loadPayment = async (paymentId: string) => {
        try {
            setLoading(true);
            const response = await paymentsService.getById(paymentId);
            setPayment(response.data);

            // Load entity information if entityId is present
            if (response.data.entityId) {
                try {
                    const entityResponse = await fetch(`/api/entities/${response.data.entityId}`);
                    if (entityResponse.ok) {
                        const entityData = await entityResponse.json();
                        setEntity(entityData);
                    }
                } catch (err) {
                    console.error("Error loading entity:", err);
                }
            }
        } catch (err) {
            console.error("Error loading payment:", err);
            setError(t("receipt.loadError"));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (value: number) => {
        return formatPrice(value);
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Check permissions (mock - replace with actual auth logic)
    // Assuming we have a useAuth hook or similar context
    const canEdit = true; // TODO: Replace with actual permission check: user.role === 'owner' || user.role === 'manager' || user.role === 'admin'

    const handleSaveAmount = async () => {
        if (!payment || !editAmount) return;

        try {
            setIsSaving(true);
            // Convert amount back to cents/units based on logic
            // If user enters "23.00", we assume they mean 23 units. 
            // If the system stores cents, we multiply by 100.
            // If the system stores units (for manual payments), we keep it as is.
            // Based on previous findings, manual payments might be stored as units but displayed as cents (divided by 100).
            // Let's assume we want to store what the user sees * 100 if it's currently divided by 100.

            const newAmount = parseFloat(editAmount.replace(',', '.'));

            // If the display divides by 100, we must multiply by 100 to save
            const amountToSave = Math.round(newAmount * 100);

            await paymentsService.update(payment.id, { amount: amountToSave });

            setPayment({ ...payment, amount: amountToSave });
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating amount:", err);
            // toast.error("Failed to update amount");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{t("receipt.error")}</h2>
                        <p className="text-muted-foreground">{error || t("receipt.notFound")}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            <div className="max-w-2xl mx-auto print:w-full print:max-w-none">
                <div className="mb-6 flex justify-end print:hidden">
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        {t("receipt.print")}
                    </Button>
                </div>

                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="text-center border-b pb-8">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4 print:hidden">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{t("receipt.title")}</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            {formatDateLong(payment.createdAt)}
                        </p>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                                {t("receipt.totalAmount")}
                            </p>

                            {isEditing ? (
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <input
                                        type="number"
                                        className="text-4xl font-bold text-primary text-center border rounded p-1 w-48"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex flex-col gap-1">
                                        <Button size="sm" onClick={handleSaveAmount} disabled={isSaving}>
                                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : t("receipt.save")}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                            {t("receipt.cancel")}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group inline-block">
                                    <h1 className="text-4xl font-bold mt-2 text-primary">
                                        {formatCurrency(payment.amount)}
                                    </h1>
                                    {canEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                            onClick={() => {
                                                setEditAmount((payment.amount / 100).toString());
                                                setIsEditing(true);
                                            }}
                                        >
                                            {t("receipt.edit")}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">{t("receipt.paidTo")}</p>
                                <p className="font-medium text-lg">{entity?.name || t("receipt.company")}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted-foreground mb-1">{t("receipt.paidBy")}</p>
                                <p className="font-medium text-lg">
                                    {/* @ts-ignore - Assuming client info might be populated or in metadata */}
                                    {payment.metadata?.clientName || t("receipt.client")}
                                </p>
                                {/* NIF/Tax ID Display */}
                                <p className="text-muted-foreground text-sm mt-1">
                                    {t("receipt.taxId")}: {
                                        // @ts-ignore
                                        payment.metadata?.clientTaxId ||
                                        // @ts-ignore
                                        (payment.bookingId?.clientInfo?.taxId) ||
                                        // @ts-ignore
                                        (payment.bookingId?.clientId?.taxId) ||
                                        t("common:na", { defaultValue: "N/A" })
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50 print:bg-white print:border">
                            <h3 className="font-semibold mb-4">{t("receipt.transactionDetails")}</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("receipt.transactionId")}</span>
                                    <span className="font-mono">{payment.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("receipt.paymentMethod")}</span>
                                    <span className="capitalize">
                                        {/* generic payment type only */}
                                        {(payment as any).type === 'manual' 
                                            ? (payment as any).paymentSource || t("paymentMethods.manual")
                                            : t("paymentMethods.online")
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("receipt.status")}</span>
                                    <span className="capitalize text-green-600 font-medium">
                                        {t("receipt.paid")}
                                    </span>
                                </div>
                                {payment.description && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("receipt.description")}</span>
                                        <span>{payment.description}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
                            <p>{t("receipt.thankYou")}</p>
                            <p className="mt-1">
                                {t("receipt.questions")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ReceiptPage;
