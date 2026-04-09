import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { IconBrowser } from "@tabler/icons-react";
import { Compass, ShieldAlertIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

function Option({ title, description, icon, disabled = false }) {
  return (
    <Item variant="outline" className={disabled ? "bg-neutral-50" : "bg-white"}>
      <ItemMedia variant="icon">
        <DynamicIcon name={icon} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline" disabled={disabled}>
          Select
        </Button>
      </ItemActions>
    </Item>
  );
}

export default function DataStorage({ onNext }) {
  return (
    <div className="flex flex-col  h-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold my-3 mb-6">Choose data provider</h1>
      <div className="flex w-full max-w-lg flex-col gap-3">
        <Option
          title="Browser Storage"
          description="Store your data in the browser's local storage."
          icon="compass"
        />
        <Option
          title="Samal Cloud Storage"
          description="Store your data in a Samal Storage Service."
          icon="cloud"
          disabled={true}
        />
        <Option
          title="Google Drive"
          description="Store your data in a Google Drive."
          icon="folder"
          disabled={true}
        />
      </div>
    </div>
  );
}
