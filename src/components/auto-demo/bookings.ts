export type Booking = {
  id: string;
  date: Date;
  time: string;
  service: string;
  customer: string;
  phone: string;
  email: string;
  vehicle: string;
  status: "Confirmed" | "Pending Confirmation";
  nextSteps: string[];
  summary: string;
};

const base = new Date();
const day = (offset: number) =>
  new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);

export const bookings: Booking[] = [
  {
    id: "b1",
    date: day(0),
    time: "9:00 AM",
    service: "PA State Inspection + Emissions",
    customer: "John Smith",
    phone: "(717) 555-0142",
    email: "j.smith@email.com",
    vehicle: "2019 Ford F-150 · 84,300 mi",
    status: "Confirmed",
    nextSteps: [
      "Pull inspection sticker inventory before 8 AM",
      "Confirm emissions bay availability",
      "SMS reminder auto-sends tonight at 6 PM",
    ],
    summary:
      "Rocky called John about his expiring PA inspection. He forgot the deadline, accepted the first available slot and asked how long the visit takes (~45 min). Booked and confirmation text sent.",
  },
  {
    id: "b2",
    date: day(0),
    time: "3:30 PM",
    service: "Brake Pad Replacement",
    customer: "Derek Ellis",
    phone: "(717) 555-0107",
    email: "d.ellis@email.com",
    vehicle: "2020 Chevy Equinox · 61,480 mi",
    status: "Confirmed",
    nextSteps: ["Confirm pad inventory for the Equinox", "Offer loaner vehicle at check-in"],
    summary:
      "Follow-up call after a declined brake estimate last month. Derek agreed to the repair once Rocky mentioned the current 10% service credit.",
  },
  {
    id: "b3",
    date: day(1),
    time: "2:00 PM",
    service: "Full Synthetic Oil Change",
    customer: "Sarah Davis",
    phone: "(717) 555-0193",
    email: "sarah.davis@email.com",
    vehicle: "2021 Honda CR-V · 41,120 mi",
    status: "Confirmed",
    nextSteps: ["Quote tire rotation add-on at check-in", "Flag 7-month service gap in customer record"],
    summary:
      "Reactivation call for an overdue oil change (last visit 7 months ago). Sarah admitted she'd been putting it off; Rocky offered a 30-minute in-and-out slot.",
  },
  {
    id: "b4",
    date: day(2),
    time: "11:00 AM",
    service: "Test Drive · Used 2018 Subaru Outback",
    customer: "Mike Johnson",
    phone: "(717) 555-0288",
    email: "mjohnson@email.com",
    vehicle: "Interested in 2018 Subaru Outback · $17,900",
    status: "Confirmed",
    nextSteps: [
      "Have the Outback detailed and pulled up front",
      "Print the clean history report",
      "Sales rep to prep financing options",
    ],
    summary:
      "Inbound inquiry on the used 2018 Outback. Rocky confirmed availability, mileage (62k) and price, then scheduled a test drive.",
  },
  {
    id: "b5",
    date: day(4),
    time: "8:30 AM",
    service: "Post-Tow Diagnostic Inspection",
    customer: "Amanda Lee",
    phone: "(717) 555-0311",
    email: "amanda.lee@email.com",
    vehicle: "2016 Toyota Camry · Towed from Route 30",
    status: "Pending Confirmation",
    nextSteps: [
      "Service manager to call Amanda first thing that morning",
      "Confirm the tow partner delivered the vehicle",
      "Send diagnostic estimate before starting work",
    ],
    summary:
      "After-hours breakdown call. Rocky routed her to the 24/7 towing partner and logged a follow-up diagnostic appointment pending vehicle drop-off.",
  },
  {
    id: "b6",
    date: day(6),
    time: "1:15 PM",
    service: "Tire Rotation + Alignment",
    customer: "Priya Raman",
    phone: "(717) 555-0166",
    email: "praman@email.com",
    vehicle: "2022 Mazda CX-5 · 28,900 mi",
    status: "Pending Confirmation",
    nextSteps: ["Text alignment pricing sheet", "Confirm slot once she replies"],
    summary:
      "Maintenance reminder call. Priya was interested but wanted to check her work schedule; Rocky penciled in the slot and sent a confirm-by-text link.",
  },
  {
    id: "b7",
    date: day(-2),
    time: "10:00 AM",
    service: "Coolant Flush",
    customer: "Greg Palmer",
    phone: "(717) 555-0122",
    email: "gpalmer@email.com",
    vehicle: "2017 Jeep Grand Cherokee · 96,200 mi",
    status: "Confirmed",
    nextSteps: ["Service completed — send review request"],
    summary:
      "Reactivation call for a customer 9 months out of service. Booked and completed; Rocky sent the post-visit review request automatically.",
  },
];

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function formatDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

export function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
