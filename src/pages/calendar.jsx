import SidebarPage from "@/pages/sidebar-page";

import * as React from "react";

import { Calendar, CalendarDayButton } from "@/components/ui/calendar";

export function Calendar21() {
  return (
    <Calendar
      mode="single"
      numberOfMonths={6}
      className="flex-1 m-3 [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
      classNames={{
        months: "grid grid-cols-3 gap-2",
      }}
    />
  );
}

export default function CalendarPage() {
  return (
    <SidebarPage>
      <Calendar21 />
    </SidebarPage>
  );
}
