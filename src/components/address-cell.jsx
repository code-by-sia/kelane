import { MapPinIcon } from "lucide-react";

export default function AddressCell({ row }) {
  const address = row.original.address;
  return (
    <div className="flex items-center gap-1">
      <MapPinIcon className="h-4" />
      <span>{address.street}</span>, <span>{address.city}</span>,
      <strong>{address.country}</strong>
    </div>
  );
}
