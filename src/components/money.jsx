import { cn } from "@/lib/utils";

const AccountingFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currencySign: "accounting",
  currency: "EUR",
});
const colors = ["text-green-800", "text-gray-900", "text-red-800"];

export default function Money({ className, amount, colored = false }) {
  const color = colored ? colors[Math.sign(amount) + 1] : "";
  return (
    <span className={cn(className, color)}>
      {AccountingFormat.format(amount)}
    </span>
  );
}
