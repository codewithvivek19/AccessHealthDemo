/**
 * Photography and imagery taken from the live Acsess website (acsess.com.au)
 * and served from the project's CDN so the pages load reliably.
 */
import elder from "@/assets/site/elder-and-woman.webp.asset.json";
import support from "@/assets/site/pexels-yan-krukov-8867476.jpg.asset.json";
import village from "@/assets/site/iStock-640147544.jpg.asset.json";
import phone from "@/assets/site/phone-4974179_1920.jpg.asset.json";
import switchStar from "@/assets/site/switch-star-with-logo-1.png.asset.json";
import switchStarLogo from "@/assets/site/switch-star-logo_FINAL.png.asset.json";
import internet from "@/assets/site/internet.png.asset.json";
import tv from "@/assets/site/tv.png.asset.json";
import telephone from "@/assets/site/telephone.png.asset.json";
import thermal from "@/assets/site/thermal_imaging.png.asset.json";
import communication from "@/assets/site/communication-icon.png.asset.json";
import dedication from "@/assets/site/dedication-icon.png.asset.json";
import passion from "@/assets/site/passion-icon.png.asset.json";

const CDN_BASE = "https://ef8988ee-ceed-4331-806f-22aa30dbeabd.lovableproject.com";

export function getAssetUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/__l5e/")) {
    return `${CDN_BASE}${url}`;
  }
  return url;
}

export const MEDIA = {
  hero: getAssetUrl(elder.url),
  heroAlt: "An older resident and a support worker looking at a tablet together",

  technician: getAssetUrl(support.url),
  technicianAlt: "An Acsess team member helping a resident with their connected services",

  village: getAssetUrl(village.url),
  villageAlt: "Residents enjoying an Australian retirement village community",

  telephone: getAssetUrl(phone.url),
  telephoneAlt: "A telephone handset in a resident's home",

  switchStar: getAssetUrl(switchStar.url),
  switchStarAlt: "The SWITCH STAR double power outlet with automatic cut-off timer",
  switchStarLogo: getAssetUrl(switchStarLogo.url),

  icons: {
    internet: getAssetUrl(internet.url),
    television: getAssetUrl(tv.url),
    telephone: getAssetUrl(telephone.url),
    thermal: getAssetUrl(thermal.url),
    communication: getAssetUrl(communication.url),
    dedication: getAssetUrl(dedication.url),
    passion: getAssetUrl(passion.url),
  },
} as const;

