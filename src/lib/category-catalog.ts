/** Full KaamSetu service catalog — 16 groups with leaf categories for booking. */

import { mergeCategoryMetadata } from "./booking-flows";

export type CategoryCatalogItem = {
  name: string;
  slug: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export type CategoryCatalogGroup = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  categories: CategoryCatalogItem[];
};

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[/&]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cat(name: string, description?: string, metadata?: Record<string, unknown>): CategoryCatalogItem {
  return { name, slug: slugifyCategory(name), description, metadata };
}

export const CATEGORY_CATALOG: CategoryCatalogGroup[] = [
  {
    name: "Home Repair & Maintenance",
    slug: "home-repair-maintenance",
    icon: "🏠",
    description: "Repairs, installations, and maintenance for every corner of your home.",
    categories: [
      cat("Plumber", "Pipe repairs, leak fixes, bathroom fittings, and water systems."),
      cat("Electrician", "Wiring, switchboards, appliances, and electrical safety."),
      cat("Carpenter", "Furniture, doors, windows, and custom woodwork."),
      cat("Painter", "Interior and exterior painting and wall finishing."),
      cat("Mason", "Brickwork, plastering, and structural repairs."),
      cat("Welder", "Metal fabrication, gates, grills, and welding repairs."),
      cat("Tile Installer", "Floor and wall tile installation and repair."),
      cat("POP/Ceiling Worker", "False ceiling, POP work, and ceiling repairs."),
      cat("Waterproofing Specialist", "Terrace, bathroom, and wall waterproofing."),
      cat("Pest Control", "Cockroach, termite, rodent, and general pest treatment."),
      cat("AC Installation", "Split/window AC installation and setup."),
      cat("AC Repair & Service", "AC servicing, gas refill, and cooling repairs."),
      cat("Refrigerator Repair", "Fridge cooling, compressor, and gasket repairs."),
      cat("Washing Machine Repair", "Drum, motor, and drainage repairs."),
      cat("Microwave Repair", "Heating, panel, and magnetron issues."),
      cat("TV Repair", "Display, board, and smart TV troubleshooting."),
      cat("RO Water Purifier Service", "Filter change, membrane, and RO repairs."),
      cat("Geyser Repair", "Heating element, thermostat, and tank fixes."),
      cat("Chimney Repair", "Motor, filter, and hood servicing."),
      cat("Inverter Repair", "Battery, PCB, and inverter maintenance."),
      cat("Generator Repair", "Engine, alternator, and generator servicing."),
      cat("Solar Panel Installation", "Rooftop solar setup and commissioning."),
      cat("Solar Panel Maintenance", "Panel cleaning and inverter checks."),
      cat("CCTV Installation", "Camera setup, DVR, and remote viewing."),
      cat("CCTV Maintenance", "Camera repair, cabling, and storage issues."),
      cat("Door Lock Repair", "Digital and mechanical lock repairs."),
      cat("Locksmith", "Lockout help, key duplication, and lock fitting."),
      cat("Furniture Assembly", "Flat-pack and modular furniture assembly."),
      cat("Furniture Repair", "Wood, upholstery, and hardware fixes."),
      cat("Sofa Repair", "Cushion, frame, and fabric restoration."),
      cat("Glass Installation & Repair", "Windows, mirrors, and toughened glass."),
      cat("Window Repair", "Sliding, hinges, and frame repairs."),
      cat("Plumbing Inspection", "Pre-purchase and leak inspection reports."),
      cat("Electrical Inspection", "Safety audit and compliance checks."),
    ],
  },
  {
    name: "Cleaning Services",
    slug: "cleaning-services",
    icon: "🧹",
    description: "Professional cleaning for homes, offices, and specialty surfaces.",
    categories: [
      cat("House Cleaning", "Regular home cleaning and dusting."),
      cat("Deep Cleaning", "Intensive whole-home sanitization."),
      cat("Kitchen Cleaning", "Degreasing, cabinets, and appliance cleaning."),
      cat("Bathroom Cleaning", "Tiles, fixtures, and mold treatment."),
      cat("Sofa Cleaning", "Fabric and leather sofa shampooing."),
      cat("Carpet Cleaning", "Steam and dry carpet cleaning."),
      cat("Mattress Cleaning", "Dust mite and stain removal."),
      cat("Water Tank Cleaning", "Overhead and underground tank cleaning."),
      cat("Apartment Cleaning", "Full apartment turnover cleaning."),
      cat("Move-in/Move-out Cleaning", "Relocation-ready deep cleaning."),
      cat("Vehicle Interior Cleaning", "Car and bike cabin detailing."),
    ],
  },
  {
    name: "Home Improvement",
    slug: "home-improvement",
    icon: "🛠️",
    description: "Design, renovation, and upgrade projects for modern living.",
    categories: [
      cat("Interior Designer", "Space planning and interior design."),
      cat("Exterior Designer", "Façade and outdoor design."),
      cat("Modular Kitchen Expert", "Custom modular kitchen design."),
      cat("Wardrobe Designer", "Built-in wardrobe and storage."),
      cat("Home Renovation", "Full or partial home remodeling."),
      cat("False Ceiling", "Gypsum and POP ceiling design."),
      cat("Flooring Installation", "Tiles, wood, vinyl, and laminate."),
      cat("Wallpaper Installation", "Wallpaper and wall panel fitting."),
    ],
  },
  {
    name: "Education",
    slug: "education",
    icon: "📚",
    description: "Tutors and coaches for school, exams, and skill building.",
    categories: [
      cat("Home Tutor", "In-person tutoring at your home."),
      cat("Online Tutor", "Live online classes and homework help."),
      cat("School Subjects", "CBSE, ICSE, and state board subjects."),
      cat("Competitive Exam Tutor", "SSC, banking, and government exams."),
      cat("IIT-JEE Coaching", "JEE Main and Advanced preparation."),
    ],
  },
  {
    name: "Beauty & Wellness",
    slug: "beauty-wellness",
    icon: "💅",
    description: "Salon, spa, and wellness services at home.",
    categories: [
      cat("Makeup Artist", "Party and occasion makeup."),
      cat("Bridal Makeup", "Wedding day bridal looks."),
      cat("Groom Makeup", "Groom grooming and styling."),
      cat("Facial", "Skin facials and treatments."),
      cat("Waxing", "Full body and partial waxing."),
      cat("Threading", "Eyebrow and facial threading."),
      cat("Manicure", "Nail care and polish."),
      cat("Pedicure", "Foot care and spa pedicure."),
      cat("Nail Art", "Creative nail design."),
      cat("Massage Therapist", "Therapeutic and relaxation massage."),
      cat("Spa at Home", "Full spa packages at home."),
      cat("Yoga Trainer", "Personal yoga sessions."),
      cat("Meditation Coach", "Mindfulness and meditation guidance."),
      cat("Fitness Trainer", "Personal fitness and workout coaching."),
    ],
  },
  {
    name: "Healthcare & Personal Care",
    slug: "healthcare-personal-care",
    icon: "🏥",
    description: "Medical support and personal care at home.",
    categories: [
      cat("Nurse", "Qualified nursing care."),
      cat("Home Nursing", "Post-discharge and ongoing nursing."),
      cat("Physiotherapist", "Rehabilitation and pain management."),
      cat("Caregiver", "Daily living assistance."),
      cat("Elder Care", "Senior companionship and care."),
      cat("Post-Surgery Care", "Recovery support after surgery."),
      cat("Disability Support Assistant", "Mobility and daily aid."),
      cat("Medical Equipment Rental", "Hospital beds, oxygen, and devices."),
      cat("Ambulance Booking", "Emergency and non-emergency transport."),
    ],
  },
  {
    name: "Childcare",
    slug: "childcare",
    icon: "👶",
    description: "Trusted care and tutoring for children.",
    categories: [
      cat("Babysitter", "Short-term child supervision."),
      cat("Daycare Provider", "Daytime child care services."),
      cat("Nanny", "Full-time or part-time nanny."),
      cat("Child Tutor", "Age-appropriate learning support."),
      cat("Special Needs Caregiver", "Care for children with special needs."),
    ],
  },
  {
    name: "Cooking & Food",
    slug: "cooking-food",
    icon: "🍳",
    description: "Chefs, cooks, and catering for every occasion.",
    categories: [
      cat("Home Chef", "Personal chef for daily meals."),
      cat("Cook", "Home cooking and meal prep."),
      cat("Party Cook", "Party and gathering meal preparation."),
      cat("Catering", "Event catering and buffet setup."),
      cat("Event Serving Staff", "Waiters and serving for events."),
      cat("Bakery Services", "Cakes, pastries, and baked goods."),
    ],
  },
  {
    name: "Transportation",
    slug: "transportation",
    icon: "🚗",
    description: "Drivers, riders, and delivery professionals.",
    categories: [
      cat("Temporary Driver", "Short-term driving — local or outstation.", {
        bookingFields: [
          {
            name: "tripType",
            label: "Trip type",
            type: "select",
            required: true,
            options: ["Local", "Outstation"],
          },
        ],
      }),
      cat("Permanent Driver", "Long-term personal driver."),
      cat("Bike Rider", "Two-wheeler riding and errands."),
      cat("Delivery Executive", "Local parcel and food delivery."),
      cat("Courier Pickup", "Pickup and drop courier services."),
    ],
  },
  {
    name: "Event Services",
    slug: "event-services",
    icon: "🎉",
    description: "Everything you need to make events unforgettable.",
    categories: [
      cat("Photographer", "Event and portrait photography."),
      cat("Videographer", "Event video coverage."),
      cat("Drone Photographer", "Aerial photo and video."),
      cat("Cinematographer", "Cinematic event films."),
      cat("Event Planner", "End-to-end event planning."),
      cat("Wedding Planner", "Full wedding coordination."),
      cat("Birthday Planner", "Birthday party planning."),
      cat("Decorator", "Venue and theme decoration."),
      cat("Balloon Decoration", "Balloon arches and party décor."),
      cat("DJ", "DJ and music for events."),
      cat("Live Band", "Live music performances."),
      cat("Singer", "Solo and group singers."),
      cat("Anchor", "Event hosting and anchoring."),
      cat("Magician", "Magic shows for parties."),
      cat("Stand-up Comedian", "Comedy acts for events."),
      cat("Event Sound System Rental", "PA and sound for events."),
      cat("Lighting Setup", "Stage and ambient lighting."),
      cat("Stage Decoration", "Stage design and setup."),
    ],
  },
  {
    name: "Digital & IT Services",
    slug: "digital-it-services",
    icon: "💻",
    description: "Tech repair, setup, and digital creative services.",
    categories: [
      cat("Computer Repair", "Desktop PC troubleshooting."),
      cat("Laptop Repair", "Laptop hardware and software fixes."),
      cat("Mobile Repair", "Screen, battery, and phone repairs."),
      cat("Printer Repair", "Printer setup and servicing."),
      cat("Wi-Fi Setup", "Router and home network setup."),
      cat("Network Installation", "LAN, cabling, and office networks."),
      cat("Data Recovery", "Hard drive and file recovery."),
      cat("Software Installation", "OS, apps, and antivirus setup."),
      cat("Website Designer", "Business and personal websites."),
      cat("Graphic Designer", "Logos, banners, and branding."),
      cat("Video Editor", "Video editing and post-production."),
      cat("Photographer Editing", "Photo retouching and editing."),
      cat("Social Media Manager", "Social content and management."),
      cat("Digital Marketing Consultant", "SEO, ads, and online growth."),
    ],
  },
  {
    name: "Automobile Services",
    slug: "automobile-services",
    icon: "🚙",
    description: "Car and bike care, repair, and roadside help.",
    categories: [
      cat("Car Wash", "Exterior and interior car wash."),
      cat("Bike Wash", "Two-wheeler washing."),
      cat("Car Mechanic", "Car engine and mechanical repairs."),
      cat("Bike Mechanic", "Bike service and repairs."),
      cat("Car Detailing", "Premium car detailing and polish."),
      cat("Tyre Replacement", "Tyre change and balancing."),
      cat("Battery Replacement", "Car and bike battery swap."),
      cat("Jump Start Service", "Dead battery jump start."),
      cat("Towing Service", "Vehicle towing and recovery."),
      cat("Puncture Repair", "Tyre puncture fix on-site."),
      cat("Oil Change", "Engine oil and filter change."),
      cat("Car AC Service", "Automotive AC repair and refill."),
    ],
  },
  {
    name: "Pet Services",
    slug: "pet-services",
    icon: "🐾",
    description: "Care, grooming, and health for your pets.",
    categories: [
      cat("Pet Grooming", "Bath, trim, and coat care."),
      cat("Pet Boarding", "Overnight pet boarding."),
      cat("Pet Walking", "Daily dog walking."),
      cat("Pet Sitting", "In-home pet sitting."),
      cat("Dog Training", "Obedience and behavior training."),
      cat("Veterinary Home Visit", "Vet consultations at home."),
      cat("Pet Taxi", "Pet transport services."),
    ],
  },
  {
    name: "Moving & Logistics",
    slug: "moving-logistics",
    icon: "📦",
    description: "Packing, moving, and storage solutions.",
    categories: [
      cat("Packers", "Professional packing services."),
      cat("Movers", "Local and intercity moving."),
      cat("House Shifting", "Complete home relocation."),
      cat("Office Relocation", "Office move and setup."),
      cat("Furniture Transport", "Furniture pickup and delivery."),
      cat("Goods Transport", "General goods transportation."),
      cat("Storage Services", "Short and long-term storage."),
    ],
  },
  {
    name: "Religious & Cultural Services",
    slug: "religious-cultural-services",
    icon: "🪔",
    description: "Puja, rituals, and cultural consultations.",
    categories: [
      cat("Priest (Puja)", "Puja and ritual ceremonies."),
      cat("Pandit Booking", "Pandit for home and event rituals."),
      cat("Temple Decoration", "Temple and mandir decoration."),
      cat("Astrology Consultation", "Horoscope and astrology guidance."),
      cat("Vastu Consultant", "Vastu analysis and remedies."),
    ],
  },
  {
    name: "Rental Services",
    slug: "rental-services",
    icon: "🎪",
    description: "Equipment and furniture rentals for events and needs.",
    categories: [
      cat("Generator Rental", "Portable generator hire."),
      cat("Sound System Rental", "Speakers, mics, and PA rental."),
      cat("Camera Rental", "DSLR and video camera rental."),
      cat("Furniture Rental", "Event and home furniture hire."),
      cat("Tent Rental", "Marquees and tent setup."),
      cat("Party Equipment Rental", "Tables, chairs, and party gear."),
      cat("Wheelchair Rental", "Mobility aid rental."),
    ],
  },
];

export const ALL_CATALOG_CATEGORIES = CATEGORY_CATALOG.flatMap((g) =>
  g.categories.map((c) => ({ ...c, groupSlug: g.slug, groupName: g.name, groupIcon: g.icon }))
);

export function getCategoryMetadata(slug: string): Record<string, unknown> | undefined {
  const item = ALL_CATALOG_CATEGORIES.find((c) => c.slug === slug);
  if (!item) return undefined;
  return mergeCategoryMetadata(slug, item.metadata);
}
