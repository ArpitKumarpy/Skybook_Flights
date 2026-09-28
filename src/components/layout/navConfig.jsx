import {
  Armchair,
  BookAIcon,
  CalendarClock,
  History,
  Plane,
  PlaneTakeoff,
  Search,
  Shield,
  Ticket,
  TicketCheck,
  User,
  UserCog,
  Paperclip,
  Users,
} from "lucide-react";

export function iconFor(tab) {
  const props = { size: 18 };
  return {
    dashboard: <Shield {...props} />,
    search: <Search {...props} />,
    fleet: <PlaneTakeoff {...props} />,
    flights: <Plane {...props} />,
    aircraft: <TicketCheck {...props} />,
    schedules: <CalendarClock {...props} />,
    seats: <Armchair {...props} />,
    users: <Users {...props} />,
    bookings: <BookAIcon {...props} />,
    passengers: <User {...props} />,
    history: <History {...props} />,
    "travel-history": <Paperclip {...props} />,
    tickets: <Ticket {...props} />,
    profile: <UserCog {...props} />,
  }[tab];
}

export function labelFor(tab) {
  const overrides = { history: "Payment history",
    "travel-history": "Travel History"};
  return overrides[tab] || (tab[0].toUpperCase() + tab.slice(1));
}
