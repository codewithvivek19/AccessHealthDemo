import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured yet.");
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
}

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type SpecItem = { label: string; value: string };

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data as Service[];
});

export const getService = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("services")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as Service | null;
  });

export const getResources = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("resources")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Resource[];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as Product | null;
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
  .inputValidator((d: unknown) => enquirySchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("enquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      organisation: data.organisation || null,
      audience: data.audience || null,
      topic: data.topic || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
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
