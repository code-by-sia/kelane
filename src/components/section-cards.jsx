import TransactionsCard from "./transactions-card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      <TransactionsCard
        className="@container/card"
        title="Assets"
        filter={(a) => a.ledger.startsWith("1")}
      />

      <TransactionsCard
        className="@container/card"
        title="Liabilities"
        filter={(a) => a.ledger.startsWith("2")}
      />

      <TransactionsCard
        className="@container/card"
        title="Stock and Equity"
        filter={(a) => a.ledger.startsWith("3")}
      />
      <TransactionsCard
        className="@container/card"
        title="Income"
        filter={(a) => a.ledger.startsWith("4")}
      />

      <TransactionsCard
        className="@container/card"
        title="Expense"
        filter={(a) => a.ledger.startsWith("5")}
      />
    </div>
  );
}
