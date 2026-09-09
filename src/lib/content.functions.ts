import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type SpecItem = { label: string; value: string };

const DEFAULT_SUPABASE_URL = "https://niqiznskadtkaaevbxhf.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_leVS-ZlfW7zyUkW7zrJFrw_4pHrGKqS";

function publicClient() {
  const url =
    (typeof process !== "undefined" && (process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"])) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
    DEFAULT_SUPABASE_URL;

  const key =
    (typeof process !== "undefined" &&
      (process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"])) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"]) ||
    DEFAULT_SUPABASE_KEY;

  if (!url || !key) return null;

  try {
    return createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
  } catch (e) {
    console.warn("[content.functions] Failed to initialize Supabase publicClient:", e);
    return null;
  }
}

const FALLBACK_SERVICES: Service[] = [
  {
    id: "srv-internet",
    slug: "village-internet",
    name: "Village Internet & Wi-Fi",
    category: "Connectivity",
    summary:
      "Purpose-built fiber and high-speed Wi-Fi designed specifically for retirement villages and residential aged care communities.",
    body: "We engineer dedicated fiber and managed wireless networks tailored for retirement village campuses. From common area mesh Wi-Fi to high-speed in-home connections, our infrastructure delivers uninterrupted speed, rock-solid reliability, and friendly local Australian support.\n\nOur solutions include community-wide Wi-Fi roaming, smart property IoT enablement, and dedicated resident technical support with zero complex contracts.",
    highlights: [
      "Dedicated village fiber infrastructure with high availability",
      "Seamless Wi-Fi roaming across community clubhouses and grounds",
      "Australian-based 7-day resident phone support",
      "No lock-in resident plans with transparent billing",
    ],
    icon: "Wifi",
    sort_order: 1,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-tv",
    slug: "foxtel-matv-television",
    name: "Foxtel & MATV Television",
    category: "Entertainment",
    summary:
      "Digital Master Antenna TV (MATV) distribution and Foxtel community integrations delivering crystal-clear reception to every dwelling.",
    body: "Acsess designs, installs, and manages state-of-the-art MATV and satellite distribution systems for multi-dwelling retirement living.\n\nResidents enjoy standard free-to-air digital broadcast alongside full Foxtel HD channel lineups without individual unsightly rooftop antennas.",
    highlights: [
      "Commercial-grade MATV systems with centralized satellite dishes",
      "Full Foxtel compatibility and simple resident setup",
      "Community channel integration for village notices and events",
      "Rapid on-site technician maintenance and signal monitoring",
    ],
    icon: "Tv",
    sort_order: 2,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-phone",
    slug: "resident-telephony",
    name: "Resident Telephony & Voice",
    category: "Communication",
    summary:
      "Reliable digital phone services designed for ease of use, with optional emergency pendant integration and simple handset setups.",
    body: "Our voice solutions keep residents seamlessly connected to family, community managers, and emergency services. We offer crystal-clear VoIP lines that work with standard corded/cordless telephones, emergency pendant stations, and intercoms.\n\nKeep existing phone numbers with hassle-free number porting handled completely by our team.",
    highlights: [
      "Keep your existing Australian phone numbers (simple porting)",
      "Compatible with emergency medical call systems and pendants",
      "Unlimited national and mobile calling bundle options",
      "Clear, loud handsets suitable for hearing aid compatibility",
    ],
    icon: "Phone",
    sort_order: 3,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-switchstar",
    slug: "switch-star",
    name: "SWITCH STAR Power Outlets",
    category: "Safety & Care",
    summary:
      "Australian-designed double power outlet with automatic cut-off timer, helping reduce appliance fire hazards for independent seniors.",
    body: "SWITCH STAR is an essential safety innovation engineered for independent living. It replaces standard wall power outlets and automatically shuts off power after a preset duration, preventing unattended kettles, irons, heaters, and cooking appliances from posing hazards.\n\nApproved to Australian electrical safety standards with intuitive illuminated push-button activation.",
    highlights: [
      "Automatic shut-off timer (pre-configured 15min, 30min, 1hr or custom)",
      "Standard double GPO retrofit — fits any Australian standard wall bracket",
      "Illuminated status indicator ring for clear operational feedback",
      "Certified to AS/NZS 3112 Australian safety standards",
    ],
    icon: "Zap",
    sort_order: 4,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-thermal",
    slug: "thermal-imaging",
    name: "Thermal & Wellness Monitoring",
    category: "Safety & Care",
    summary:
      "Non-intrusive safety and thermal imaging technologies for early incident detection while protecting resident dignity and privacy.",
    body: "Non-optical thermal sensors detect sudden changes in resident movement and wellness without cameras or privacy invasion. Village care teams receive immediate notifications if assistance is needed.",
    highlights: [
      "100% optical privacy — no cameras or recorded imagery",
      "Immediate alert notifications for village managers and care teams",
      "Assists in preventing falls and unattended emergency situations",
      "Non-stigmatizing discreet ceiling and wall sensor placements",
    ],
    icon: "Activity",
    sort_order: 5,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-mobile",
    slug: "mobile-coverage",
    name: "In-Building Mobile Coverage",
    category: "Connectivity",
    summary:
      "Distributed Antenna Systems (DAS) ensuring full cellular 4G/5G signal strength across all buildings, basements, and common areas.",
    body: "Eliminate mobile blackspots in retirement village apartments, lifts, community centers, and underground car parks. Our cellular repeater systems amplify Telstra, Optus, and Vodafone coverage throughout the property.",
    highlights: [
      "Multi-carrier support (Telstra, Optus, TPG/Vodafone)",
      "Full coverage across basement parking, lifts, and residential units",
      "Carrier-approved legal active repeater installations",
      "Reliable voice calls for mobile medical emergency alerts",
    ],
    icon: "Radio",
    sort_order: 6,
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

const FALLBACK_PRODUCT: Product = {
  id: "prod-switchstar",
  slug: "switchstar",
  name: "SWITCH STAR",
  tagline: "A double power outlet that switches itself off, for peace of mind in independent living.",
  description:
    "SWITCH STAR is an Australian-engineered automatic cut-off double power point that protects residents and retirement properties from fires caused by unattended heating, cooking, and ironing appliances. It operates like a standard wall outlet with a built-in intelligent timer that cuts off power after a set period unless re-activated.",
  specifications: [
    { label: "Voltage Rating", value: "240V AC 50Hz, 10A Max" },
    { label: "Timer Duration", value: "Factory set 30 minutes (adjustable 15 to 120 min)" },
    { label: "Outlets", value: "Twin switched GPO with safety shutters" },
    { label: "Standards", value: "AS/NZS 3112, AS/NZS 3105 Compliant" },
    { label: "Dimensions", value: "115mm x 73mm x 28mm (Standard Australian Plate)" },
    { label: "Warranty", value: "3 Years Replacement Warranty" },
  ],
  is_published: true,
  created_at: new Date().toISOString(),
};

const FALLBACK_RESOURCES: Resource[] = [
  {
    id: "res-1",
    slug: "retirement-village-wifi-guide",
    title: "Designing Connected Communities: A Guide for Village Operators",
    kind: "guide",
    excerpt:
      "Best practices for planning, upgrading, and managing high-density fiber networks across modern Australian retirement villages.",
    body: "High-speed digital connectivity is now considered the fourth essential utility by incoming retirement living residents. This guide outlines how operators can implement reliable shared infrastructure while reducing operational overhead.",
    external_url: null,
    image_url: null,
    published_at: "2026-08-15T00:00:00Z",
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "res-2",
    slug: "switchstar-fire-prevention-whitepaper",
    title: "Electrical Appliance Safety & Fire Hazard Prevention in Independent Living",
    kind: "article",
    excerpt:
      "How timer-switched power points significantly reduce accidental kitchen and appliance fires in seniors living accommodation.",
    body: "Statistical analysis shows unattended appliances represent over 40% of residential fires in senior living environments. Automatic timer cut-off technology provides a fail-safe measure.",
    external_url: null,
    image_url: null,
    published_at: "2026-07-28T00:00:00Z",
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "res-3",
    slug: "faq-internet-connection",
    title: "Frequently Asked Questions: Resident Internet Setup & Technical Support",
    kind: "faq",
    excerpt: "Answers to common questions about moving in, transferring phone numbers, and accessing our Australian helpdesk.",
    body: "Q: Do I need a technician to visit when I move in?\nA: In most Acsess-connected villages, your home is pre-cabled. Simply plug in your router and connect.\n\nQ: Can I keep my existing phone number?\nA: Yes! Our team handles the porting process from your previous provider.",
    external_url: null,
    image_url: null,
    published_at: "2026-09-01T00:00:00Z",
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("services")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (!error && data && data.length > 0) {
        return data as Service[];
      }
    } catch (err) {
      console.warn("[getServices] Error fetching from Supabase, returning fallback data:", err);
    }
  }
  return FALLBACK_SERVICES;
});

export const getService = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const client = publicClient();
    if (client) {
      try {
        const { data: row, error } = await client
          .from("services")
          .select("*")
          .eq("slug", data.slug)
          .eq("is_published", true)
          .maybeSingle();
        if (!error && row) {
          return row as Service;
        }
      } catch (err) {
        console.warn(`[getService] Error fetching slug "${data.slug}":`, err);
      }
    }
    const match = FALLBACK_SERVICES.find((s) => s.slug === data.slug);
    return match ?? null;
  });

export const getResources = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("resources")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Resource[];
      }
    } catch (err) {
      console.warn("[getResources] Error fetching from Supabase, returning fallback data:", err);
    }
  }
  return FALLBACK_RESOURCES;
});

export const getProduct = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const client = publicClient();
    if (client) {
      try {
        const { data: row, error } = await client
          .from("products")
          .select("*")
          .eq("slug", data.slug)
          .maybeSingle();
        if (!error && row) {
          return row as Product;
        }
      } catch (err) {
        console.warn(`[getProduct] Error fetching product "${data.slug}":`, err);
      }
    }
    if (data.slug === "switchstar") return FALLBACK_PRODUCT;
    return null;
  });

const enquirySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().or(z.literal("")),
  organisation: z.string().max(160).optional().or(z.literal("")),
  audience: z.string().max(60).optional().or(z.literal("")),
  topic: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(5).max(4000),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((d: unknown) => enquirySchema.parse(d))
  .handler(async ({ data }) => {
    const client = publicClient();
    if (client) {
      try {
        const { error } = await client.from("enquiries").insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          organisation: data.organisation || null,
          audience: data.audience || null,
          topic: data.topic || null,
          message: data.message,
        });
        if (error) {
          console.warn("[submitEnquiry] Supabase insert warning:", error.message);
        }
      } catch (err) {
        console.warn("[submitEnquiry] Failed to insert enquiry to Supabase:", err);
      }
    }
    return { ok: true };
  });

export const servicesQuery = {
  queryKey: ["services"] as const,
  queryFn: () => getServices(),
};

export const resourcesQuery = {
  queryKey: ["resources"] as const,
  queryFn: () => getResources(),
};

export const serviceQuery = (slug: string) => ({
  queryKey: ["service", slug] as const,
  queryFn: () => getService({ data: { slug } }),
});

export const productQuery = (slug: string) => ({
  queryKey: ["product", slug] as const,
  queryFn: () => getProduct({ data: { slug } }),
});
