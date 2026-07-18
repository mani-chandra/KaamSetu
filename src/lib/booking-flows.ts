/** Booking flow types and per-category configuration. */

export type BookingFlow =
  | "instant"
  | "repair"
  | "inspection"
  | "recurring"
  | "marketplace"
  | "consultation"
  | "emergency";

export type ServicePackageDef = {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
};

export type BookingFlowConfig = {
  bookingFlow: BookingFlow;
  emergencyEligible?: boolean;
  packages?: ServicePackageDef[];
  commonIssues?: string[];
  consultationModes?: string[];
};

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[/&]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const INSTANT_SLUGS = [
  "House Cleaning", "Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning",
  "Sofa Cleaning", "Carpet Cleaning", "Mattress Cleaning", "Water Tank Cleaning",
  "Apartment Cleaning", "Move-in/Move-out Cleaning", "Vehicle Interior Cleaning",
  "Facial", "Waxing", "Threading", "Manicure", "Pedicure", "Nail Art",
  "Massage Therapist", "Spa at Home",
  "Car Wash", "Bike Wash", "Car Detailing", "Oil Change",
  "Generator Rental", "Sound System Rental", "Camera Rental", "Furniture Rental",
  "Tent Rental", "Wheelchair Rental", "Party Equipment Rental", "Event Sound System Rental",
].map(slug);

const REPAIR_SLUGS = [
  "Plumber", "Electrician", "Carpenter", "Pest Control", "AC Repair & Service",
  "Refrigerator Repair", "Washing Machine Repair", "Microwave Repair", "TV Repair",
  "RO Water Purifier Service", "Geyser Repair", "Chimney Repair", "Inverter Repair",
  "Generator Repair", "CCTV Maintenance", "Door Lock Repair", "Locksmith",
  "Furniture Repair", "Sofa Repair", "Glass Installation & Repair", "Window Repair",
  "Computer Repair", "Laptop Repair", "Mobile Repair", "Printer Repair",
  "Data Recovery", "Software Installation",
  "Car Mechanic", "Bike Mechanic", "Tyre Replacement", "Battery Replacement",
  "Jump Start Service", "Towing Service", "Puncture Repair", "Car AC Service",
].map(slug);

const INSPECTION_SLUGS = [
  "Painter", "Mason", "Welder", "Tile Installer", "POP/Ceiling Worker",
  "Waterproofing Specialist", "AC Installation", "Solar Panel Installation",
  "Solar Panel Maintenance", "CCTV Installation", "Furniture Assembly",
  "Plumbing Inspection", "Electrical Inspection",
  "Interior Designer", "Exterior Designer", "Modular Kitchen Expert",
  "Wardrobe Designer", "Home Renovation", "False Ceiling",
  "Flooring Installation", "Wallpaper Installation",
  "Packers", "Movers", "House Shifting", "Office Relocation",
  "Furniture Transport", "Goods Transport", "Storage Services",
].map(slug);

const RECURRING_SLUGS = [
  "Home Tutor", "Online Tutor", "School Subjects", "Competitive Exam Tutor", "IIT-JEE Coaching",
  "Yoga Trainer", "Meditation Coach", "Fitness Trainer",
  "Home Nursing", "Physiotherapist", "Caregiver", "Elder Care", "Disability Support Assistant",
  "Babysitter", "Daycare Provider", "Nanny", "Child Tutor", "Special Needs Caregiver",
  "Home Chef", "Cook", "Permanent Driver",
  "Pet Grooming", "Pet Walking", "Pet Sitting", "Dog Training",
].map(slug);

const MARKETPLACE_SLUGS = [
  "Makeup Artist", "Bridal Makeup", "Groom Makeup",
  "Party Cook", "Catering", "Bakery Services",
  "Photographer", "Videographer", "Drone Photographer", "Cinematographer",
  "Event Planner", "Wedding Planner", "Birthday Planner", "Decorator",
  "Balloon Decoration", "DJ", "Live Band", "Singer", "Anchor",
  "Magician", "Stand-up Comedian", "Lighting Setup", "Stage Decoration",
  "Website Designer", "Graphic Designer", "Video Editor", "Photographer Editing",
  "Social Media Manager", "Digital Marketing Consultant",
].map(slug);

const CONSULTATION_SLUGS = [
  "Astrology Consultation", "Vastu Consultant", "Priest (Puja)", "Pandit Booking",
  "Veterinary Home Visit",
].map(slug);

const EMERGENCY_SLUGS = [
  "Plumber", "Electrician", "Locksmith", "Ambulance Booking", "Nurse",
  "Generator Repair", "Car Mechanic", "Bike Mechanic", "Battery Replacement",
  "Jump Start Service", "Towing Service",
].map(slug);

const COMMON_ISSUES: Record<string, string[]> = {
  plumber: ["Leak / dripping tap", "Blocked drain", "Low water pressure", "Geyser not heating", "Pipe burst"],
  electrician: ["Power outage in room", "Switch/socket not working", "MCB tripping", "Fan not working", "Wiring issue"],
  "ac-repair-service": ["Not cooling", "Water leakage", "Strange noise", "Bad smell", "Not turning on"],
  "refrigerator-repair": ["Not cooling", "Ice buildup", "Water leakage", "Compressor issue"],
  "washing-machine-repair": ["Not spinning", "Water not draining", "Excessive vibration", "Not starting"],
  "tv-repair": ["No display", "No sound", "Screen lines", "Not powering on"],
  "car-mechanic": ["Engine won't start", "Strange noise", "Overheating", "Brake issue"],
  "bike-mechanic": ["Won't start", "Chain issue", "Brake problem", "Electrical fault"],
  locksmith: ["Locked out", "Key broken in lock", "Lock jammed", "Need new lock"],
};

const DEFAULT_PACKAGES: Record<string, ServicePackageDef[]> = {
  "house-cleaning": [
    { id: "basic", name: "Basic Clean", description: "1 BHK — dusting, mopping, bathroom", price: 799, durationMinutes: 120 },
    { id: "standard", name: "Standard Clean", description: "2 BHK — full home cleaning", price: 1299, durationMinutes: 180 },
    { id: "premium", name: "Premium Clean", description: "3 BHK — deep surface clean", price: 1899, durationMinutes: 240 },
  ],
  "deep-cleaning": [
    { id: "1bhk", name: "1 BHK Deep Clean", price: 1499, durationMinutes: 240 },
    { id: "2bhk", name: "2 BHK Deep Clean", price: 2499, durationMinutes: 360 },
    { id: "3bhk", name: "3 BHK Deep Clean", price: 3499, durationMinutes: 480 },
  ],
  "car-wash": [
    { id: "exterior", name: "Exterior Wash", price: 299, durationMinutes: 30 },
    { id: "interior", name: "Interior + Exterior", price: 599, durationMinutes: 60 },
    { id: "detailing", name: "Full Detailing", price: 1499, durationMinutes: 180 },
  ],
  "bike-wash": [
    { id: "basic", name: "Basic Wash", price: 149, durationMinutes: 20 },
    { id: "premium", name: "Premium Wash + Polish", price: 349, durationMinutes: 45 },
  ],
  facial: [
    { id: "basic", name: "Basic Facial", price: 699, durationMinutes: 45 },
    { id: "gold", name: "Gold Facial", price: 1299, durationMinutes: 60 },
  ],
};

const CONSULTATION_MODES = ["Online", "Phone", "Home Visit", "In-Person"];

const RECURRING_FREQUENCIES = ["Daily", "Weekly", "Alternate Days", "Monthly", "Custom Schedule"];

const FLOW_BY_SLUG = new Map<string, BookingFlow>();

function assign(slugs: string[], flow: BookingFlow) {
  for (const s of slugs) FLOW_BY_SLUG.set(s, flow);
}

assign(INSTANT_SLUGS, "instant");
assign(REPAIR_SLUGS, "repair");
assign(INSPECTION_SLUGS, "inspection");
assign(RECURRING_SLUGS, "recurring");
assign(MARKETPLACE_SLUGS, "marketplace");
assign(CONSULTATION_SLUGS, "consultation");

export function getBookingFlow(categorySlug: string): BookingFlow {
  return FLOW_BY_SLUG.get(categorySlug) ?? "repair";
}

export function isEmergencyEligible(categorySlug: string): boolean {
  return EMERGENCY_SLUGS.includes(categorySlug);
}

export function getBookingFlowConfig(categorySlug: string): BookingFlowConfig {
  const bookingFlow = getBookingFlow(categorySlug);
  return {
    bookingFlow,
    emergencyEligible: isEmergencyEligible(categorySlug),
    packages: DEFAULT_PACKAGES[categorySlug],
    commonIssues: COMMON_ISSUES[categorySlug],
    consultationModes: bookingFlow === "consultation" ? CONSULTATION_MODES : undefined,
  };
}

export function getRecurringFrequencies() {
  return RECURRING_FREQUENCIES;
}

export function bookingFlowToType(flow: BookingFlow): string {
  const map: Record<BookingFlow, string> = {
    instant: "INSTANT",
    repair: "QUOTE",
    inspection: "QUOTE",
    recurring: "RECURRING",
    marketplace: "MARKETPLACE",
    consultation: "CONSULTATION",
    emergency: "EMERGENCY",
  };
  return map[flow];
}

export function mergeCategoryMetadata(
  slug: string,
  existing?: Record<string, unknown>
): Record<string, unknown> {
  const flowConfig = getBookingFlowConfig(slug);
  return {
    ...existing,
    bookingFlow: flowConfig.bookingFlow,
    emergencyEligible: flowConfig.emergencyEligible,
    ...(flowConfig.packages ? { packages: flowConfig.packages } : {}),
    ...(flowConfig.commonIssues ? { commonIssues: flowConfig.commonIssues } : {}),
    ...(flowConfig.consultationModes ? { consultationModes: flowConfig.consultationModes } : {}),
  };
}
