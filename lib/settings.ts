import { createClient } from "./supabase/server";
import { SiteSettings } from "./types";

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  site_name: "مدونات الكريبتو",
  site_name_en: "Crypto Blog",
  site_description: "منصة الكريبتو العربية",
  site_description_en: "Arabic Crypto Platform",
  logo_url: "",
  primary_color: "#f59e0b",
  secondary_color: "#3b82f6",
  updated_at: new Date().toISOString(),
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) return DEFAULT_SETTINGS;

    return {
      id: data.id,
      site_name: data.site_name || DEFAULT_SETTINGS.site_name,
      site_name_en: data.site_name_en || DEFAULT_SETTINGS.site_name_en,
      site_description: data.site_description || DEFAULT_SETTINGS.site_description,
      site_description_en: data.site_description_en || DEFAULT_SETTINGS.site_description_en,
      logo_url: data.logo_url || "",
      primary_color: data.primary_color || DEFAULT_SETTINGS.primary_color,
      secondary_color: data.secondary_color || DEFAULT_SETTINGS.secondary_color,
      updated_at: data.updated_at || DEFAULT_SETTINGS.updated_at,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  updates: Partial<Omit<SiteSettings, "id">>
): Promise<SiteSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();

  if (error || !data) return null;
  return data as SiteSettings;
}
