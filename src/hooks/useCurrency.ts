import { useRegion } from "../contexts/region-context";

export function useCurrency() {
  const { region, regionConfig } = useRegion();

  const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(regionConfig.locale, {
      style: "currency",
      currency: regionConfig.currency,
      ...options,
    }).format(amount);
  };

  const getCurrencySymbol = () => regionConfig.currencySymbol;

  const getCurrencyCode = () => regionConfig.currency;

  return {
    formatCurrency,
    getCurrencySymbol,
    getCurrencyCode,
    region,
    regionConfig,
  };
}
