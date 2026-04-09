import { useMemo } from "react";

export default function EmailCell({ row }) {
  const email = useMemo(() => row.getValue("email"), [row]);

  return (
    <a className="font-mono hover:underline" href={`mailto:${email}`}>
      {email}
    </a>
  );
}
