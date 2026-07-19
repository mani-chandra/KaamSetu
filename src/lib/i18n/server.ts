import { cookies } from "next/headers";
import { translations, type Locale } from "./translations";

export function resolveLocale(value: string | undefined | null): Locale {
  if (value && value in translations) {
    return value as Locale;
  }
  return "en";
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get("kaamsetu-locale")?.value);
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  return translations[locale];
}
