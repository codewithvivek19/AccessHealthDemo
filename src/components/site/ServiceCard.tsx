import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/content.functions";
import internet from "@/assets/site/bento-internet.jpg";
import tv from "@/assets/site/bento-tv.jpg";
import phone from "@/assets/site/bento-phone.jpg";
import thermal from "@/assets/site/bento-thermal.jpg";
import mobile from "@/assets/site/bento-mobile.jpg";
import face from "@/assets/site/bento-face.jpg";
import { MEDIA } from "@/lib/media";
export const SERVICE_IMAGES: Record<string, string> = {
  "village-internet": internet,
  "matv-foxtel": tv,
  "foxtel-matv-television": tv,
  telephone: phone,
  "resident-telephony": phone,
  "thermal-imaging": thermal,
  "das-mobile-coverage": mobile,
  "mobile-coverage": mobile,
  "facial-recognition": face,
  "switch-star": MEDIA.switchStar,
};
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <Link className="a-service-card" to="/services/$slug" params={{ slug: service.slug }}>
      <div
        className={`a-service-image ${service.slug === "switch-star" ? "a-service-product-image" : ""}`}
      >
        {SERVICE_IMAGES[service.slug] && (
          <img src={SERVICE_IMAGES[service.slug]} alt="" loading="lazy" />
        )}
        <span className="a-card-index">
          {String(index + 1).padStart(2, "0")} / {service.category}
        </span>
        <span className="a-card-arrow">
          <ArrowUpRight size={24} />
        </span>
      </div>
      <div className="a-service-copy">
        <h3>{service.name}</h3>
        <p>{service.summary}</p>
      </div>
    </Link>
  );
}
