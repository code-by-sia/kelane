import React from "react";
import CopyButton from "./copy-button";

export default function IbanCell({ row }) {
  const rawIban = row.original.iban || "";
  const cleanIban = rawIban.replace(/\s/g, "").toUpperCase();

  const countryCode = cleanIban.substring(0, 2);
  const rest = cleanIban.substring(2);
  const segments = rest.match(/.{1,4}/g) || [];

  return (
    <div className="group flex items-center gap-1.5 font-mono text-sm leading-none h-8">
      <strong className="font-bold text-foreground">{countryCode}</strong>
      {segments.map((segment, index) => (
        <span key={index} className="text-muted-foreground">
          {segment}
        </span>
      ))}
      <CopyButton value={cleanIban} />
    </div>
  );
}
