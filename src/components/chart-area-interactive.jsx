"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import useTransactions, { useArticles } from "@/hooks/transactions";
import { LogIn } from "lucide-react";

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Transaction",
  },
  assets: {
    label: "Assets",
    color: "#0000a8",
  },
  liabilities: {
    label: "Liabilities",
    color: "#a80000",
  },
  equity: {
    label: "Stock And Equity",
    color: "#a80000",
  },
  income: {
    label: "Income/Revenue",
    color: "#a80000",
  },
  expense: {
    label: "Expense",
    color: "#a80000",
  },
};

const TimeRangeTranslation = {
  "90d": "3 months",
  "30d": "30 days",
  "7d": "7 days",
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("90d");

  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const referenceDate = endDate;
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const start = new Date(referenceDate);
    start.setDate(start.getDate() - daysToSubtract);

    return start;
  }, [timeRange, endDate]);

  useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const { transactions } = useTransactions();
  const data = useMemo(
    () =>
      transactions
        .map(({ date, ...rest }) => ({ date: new Date(date), ...rest }))
        .filter((t) => t.date >= startDate && t.date <= endDate)
        .map((t) => {
          const aa = t.articles.map((a) => ({
            ledger: a.ledger[0],
            change: a.credit * 1 - a.debit * 1,
          }));

          const g = Object.groupBy(aa, (i) => i.ledger);
          const calc = (i) => (g[i] || []).reduce((x, y) => x + y.change, 0);

          return {
            date: t.date,
            assets: calc(1),
            liabilities: calc(2),
            equity: calc(3),
            income: calc(4),
            expense: calc(5),
          };
        }),
    [startDate, endDate, transactions],
  );

  console.log(data);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last {TimeRangeTranslation[timeRange] || timeRange}
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillassets" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-assets)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-assets)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillliabilities" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-liabilities)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-liabilities)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="assets" type="natural" stackId="a" />
            <Area dataKey="liabilities" type="natural" stackId="a" />
            <Area dataKey="equity" type="natural" stackId="a" />
            <Area dataKey="income" type="natural" stackId="a" />
            <Area dataKey="expense" type="natural" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
