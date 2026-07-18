import { PrismaClient, UserRole, ProfessionalStatus, BadgeType, MembershipTarget } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import {
  DEFAULT_COMMON_SKILLS,
  DEFAULT_LANGUAGES,
  DEFAULT_SERVICE_AREAS_BY_CITY,
} from "../src/lib/pro-options-defaults";
import { CATEGORY_CATALOG } from "../src/lib/category-catalog";
import { getServiceIcon } from "../src/lib/service-icons";

const prisma = new PrismaClient();

function defaultSkillsForCategory(categoryName: string): string[] {
  return [
    "On-site service",
    "Consultation",
    "Emergency availability",
    "Quality guarantee",
  ].filter((s) => s !== categoryName);
}

const cities = [
  { name: "Mumbai", slug: "mumbai", state: "Maharashtra" },
  { name: "Delhi", slug: "delhi", state: "Delhi" },
  { name: "Bangalore", slug: "bangalore", state: "Karnataka" },
  { name: "Hyderabad", slug: "hyderabad", state: "Telangana" },
  { name: "Chennai", slug: "chennai", state: "Tamil Nadu" },
  { name: "Pune", slug: "pune", state: "Maharashtra" },
];

async function main() {
  const adminPassword = await hashPassword("admin123");
  const customerPassword = await hashPassword("customer123");
  const proPassword = await hashPassword("pro123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@kaamsetu.com" },
    update: {},
    create: {
      email: "admin@kaamsetu.com",
      name: "Platform Admin",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      city: "Mumbai",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      name: "Demo Customer",
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      phone: "+91 9876543210",
      city: "Mumbai",
      customerProfile: {
        create: {
          address: "Andheri West, Mumbai",
          pincode: "400058",
        },
      },
    },
  });

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city,
    });
  }

  for (const [groupIndex, group] of CATEGORY_CATALOG.entries()) {
    const dbGroup = await prisma.categoryGroup.upsert({
      where: { slug: group.slug },
      update: {
        name: group.name,
        icon: group.icon,
        description: group.description,
        sortOrder: groupIndex,
        isActive: true,
      },
      create: {
        name: group.name,
        slug: group.slug,
        icon: group.icon,
        description: group.description,
        sortOrder: groupIndex,
      },
    });

    for (const [catIndex, category] of group.categories.entries()) {
      await prisma.serviceCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          icon: getServiceIcon(category.slug),
          groupId: dbGroup.id,
          sortOrder: groupIndex * 1000 + catIndex,
          metadata: category.metadata ?? undefined,
          isActive: true,
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: group.icon,
          groupId: dbGroup.id,
          sortOrder: groupIndex * 1000 + catIndex,
          metadata: category.metadata ?? undefined,
          servicePage: {
            create: {
              headline: `Professional ${category.name} Services`,
              content: category.description ?? `Book verified ${category.name.toLowerCase()} professionals near you.`,
              whatsIncluded: ["Verified professionals", "Transparent pricing", "Customer reviews", "Booking support"],
              pricingGuidance: "Prices vary based on scope. Instant booking available for standard services.",
              faq: [
                { q: `How do I book a ${category.name.toLowerCase()}?`, a: "Search, compare profiles, and book instantly or request a quote." },
                { q: "Are professionals verified?", a: "Yes, all professionals are verified by our admin team before going live." },
              ],
            },
          },
        },
      });
    }
  }

  const allCategories = await prisma.serviceCategory.findMany();
  for (const category of allCategories) {
    await prisma.predefinedSkill.upsert({
      where: { categoryId_name: { categoryId: category.id, name: category.name } },
      update: { isActive: true, sortOrder: 0 },
      create: { categoryId: category.id, name: category.name, sortOrder: 0 },
    });

    const extraSkills = defaultSkillsForCategory(category.name);
    for (const [i, skillName] of extraSkills.entries()) {
      if (skillName === category.name) continue;
      await prisma.predefinedSkill.upsert({
        where: { categoryId_name: { categoryId: category.id, name: skillName } },
        update: { isActive: true, sortOrder: i + 1 },
        create: { categoryId: category.id, name: skillName, sortOrder: i + 1 },
      });
    }
  }

  for (const [i, skillName] of DEFAULT_COMMON_SKILLS.entries()) {
    const existing = await prisma.predefinedSkill.findFirst({
      where: { categoryId: null, name: skillName },
    });
    if (existing) {
      await prisma.predefinedSkill.update({
        where: { id: existing.id },
        data: { isActive: true, sortOrder: i },
      });
    } else {
      await prisma.predefinedSkill.create({
        data: { categoryId: null, name: skillName, sortOrder: i },
      });
    }
  }

  const allCities = await prisma.city.findMany();
  for (const city of allCities) {
    const areas = DEFAULT_SERVICE_AREAS_BY_CITY[city.name] ?? [];
    for (const [i, areaName] of areas.entries()) {
      await prisma.predefinedServiceArea.upsert({
        where: { cityId_name: { cityId: city.id, name: areaName } },
        update: { isActive: true, sortOrder: i },
        create: { cityId: city.id, name: areaName, sortOrder: i },
      });
    }
  }

  for (const [i, lang] of DEFAULT_LANGUAGES.entries()) {
    await prisma.predefinedLanguage.upsert({
      where: { name: lang },
      update: { isActive: true, sortOrder: i },
      create: { name: lang, sortOrder: i },
    });
  }

  const plumberCategory = await prisma.serviceCategory.findUnique({ where: { slug: "plumber" } });
  const electricianCategory = await prisma.serviceCategory.findUnique({ where: { slug: "electrician" } });

  const proUser = await prisma.user.upsert({
    where: { email: "pro@demo.com" },
    update: {},
    create: {
      email: "pro@demo.com",
      name: "Rajesh Kumar",
      passwordHash: proPassword,
      role: UserRole.PROFESSIONAL,
      phone: "+91 9876543211",
      city: "Mumbai",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
      professionalProfile: {
        create: {
          status: ProfessionalStatus.APPROVED,
          bio: "Licensed plumber with 12 years of experience in residential and commercial plumbing.",
          experienceYears: 12,
          skills: ["Pipe repair", "Bathroom fitting", "Water heater", "Leak detection"],
          languages: ["Hindi", "English", "Marathi"],
          certifications: ["Licensed Plumber - MH State"],
          serviceAreas: ["Andheri West", "Bandra", "Juhu", "Powai"],
          responseTime: 30,
          completedJobs: 245,
          avgRating: 4.8,
          reviewCount: 89,
          isVerified: true,
          services: plumberCategory
            ? {
                create: [
                  {
                    categoryId: plumberCategory.id,
                    title: "General Plumbing",
                    description: "All types of plumbing repairs and installations",
                    priceType: "fixed",
                    price: 499,
                  },
                ],
              }
            : undefined,
          availability: {
            create: [
              { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },
              { dayOfWeek: 6, startTime: "10:00", endTime: "16:00" },
            ],
          },
          badges: {
            create: [
              { type: BadgeType.VERIFIED, label: "Verified Professional", description: "Identity and credentials verified" },
              { type: BadgeType.TOP_RATED, label: "Top Rated", description: "Consistently rated 4.5+ stars" },
              { type: BadgeType.EXPERIENCED, label: "Experienced Professional", description: "100+ completed jobs" },
            ],
          },
        },
      },
    },
    include: { professionalProfile: true },
  });

  await prisma.user.upsert({
    where: { email: "priya@demo.com" },
    update: {},
    create: {
      email: "priya@demo.com",
      name: "Priya Sharma",
      passwordHash: proPassword,
      role: UserRole.PROFESSIONAL,
      phone: "+91 9876543212",
      city: "Mumbai",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      professionalProfile: {
        create: {
          status: ProfessionalStatus.APPROVED,
          bio: "Certified electrician specializing in home wiring and smart home installations.",
          experienceYears: 8,
          skills: ["Home wiring", "Smart switches", "MCB repair", "Fan installation"],
          languages: ["Hindi", "English"],
          certifications: ["Electrical License"],
          serviceAreas: ["Andheri West", "Goregaon", "Malad"],
          responseTime: 45,
          completedJobs: 156,
          avgRating: 4.7,
          reviewCount: 62,
          isVerified: true,
          services: electricianCategory
            ? {
                create: [
                  {
                    categoryId: electricianCategory.id,
                    title: "Electrical Services",
                    priceType: "quote",
                    minPrice: 300,
                    maxPrice: 5000,
                  },
                ],
              }
            : undefined,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "pending@demo.com" },
    update: {},
    create: {
      email: "pending@demo.com",
      name: "Amit Pending",
      passwordHash: proPassword,
      role: UserRole.PROFESSIONAL,
      city: "Delhi",
      professionalProfile: {
        create: {
          status: ProfessionalStatus.PENDING,
          bio: "New carpenter looking to join the platform.",
          experienceYears: 3,
          skills: ["Furniture repair"],
          languages: ["Hindi"],
          serviceAreas: ["South Delhi"],
        },
      },
    },
  });

  for (const plan of [
    {
      name: "KaamSetu Plus",
      slug: "customer-plus",
      target: MembershipTarget.CUSTOMER,
      description: "Priority booking, exclusive discounts, and service warranty",
      price: 299,
      features: ["Priority booking", "10% discount", "Service warranty", "Exclusive offers"],
    },
    {
      name: "Professional Premium",
      slug: "pro-premium",
      target: MembershipTarget.PROFESSIONAL,
      description: "Boosted visibility, analytics, and premium profile placement",
      price: 499,
      features: ["Profile boost", "Business analytics", "Priority support", "Premium badge"],
    },
  ]) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  await prisma.promotionalBanner.createMany({
    data: [
      {
        title: "Find Trusted Professionals Near You",
        subtitle: "Verified experts for every local service",
        linkUrl: "/search",
        isActive: true,
        sortOrder: 0,
      },
      {
        title: "Join as a Professional",
        subtitle: "Grow your business with KaamSetu",
        linkUrl: "/pro/register",
        isActive: true,
        sortOrder: 1,
      },
    ],
  });

  console.log("Seed completed:");
  console.log("- Admin:", admin.email, "/ admin123");
  console.log("- Customer:", customer.email, "/ customer123");
  console.log("- Professional:", proUser.email, "/ pro123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
