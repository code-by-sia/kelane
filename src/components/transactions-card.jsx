import { Badge } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { IconTrendingUp } from "@tabler/icons-react";
import Money from "./money";
import useTransactions from "@/hooks/transactions";
import { useMemo } from "react";

export default function TransactionsCard({ className, title, filter }) {
  const { transactions } = useTransactions();
  const articles = useMemo(
    () => transactions.flatMap((a) => a.articles),
    transactions,
  );

  const { balance, credit, debit } = useMemo(
    () =>
      articles
        .filter(filter)
        .map((i) => ({
          credit: i.credit * 1,
          debit: i.debit * 1,
          balance: i.credit * 1 - i.debit * 1,
        }))
        .reduce(
          (o, p) => ({
            credit: o.credit + p.credit,
            debit: o.debit + p.debit,
            balance: o.balance + p.balance,
          }),
          { credit: 0.0, debit: 0.0, balance: 0.0 },
        ),
    [articles, filter],
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <Money colored amount={balance} />
        </CardTitle>

        {/* <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>*/}
      </CardHeader>
      {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Visitors for the last 6 months
        </div>
      </CardFooter>*/}
    </Card>
  );
}
