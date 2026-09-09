import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Check, Wifi, Phone, Tv, Headphones } from "lucide-react";
import { servicesQuery, resourcesQuery } from "@/lib/content.functions";
import { Section, SectionHeading } from "@/components/site/Prose";
import { Reveal } from "@/components/site/Reveal";
import { Landscape } from "@/components/site/Landscape";
import { ServiceCard } from "@/components/site/ServiceCard";
import { MEDIA } from "@/lib/media";
import { CONTACT } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acsess Health — Better connected communities" },
      {
        name: "description",
        content:
          "Internet, television, telephone and safety technology for Australian retirement villages, aged care and healthcare communities. Designed, installed and supported by Acsess.",
      },
      { property: "og:title", content: "Acsess Health — Better connected communities" },
      {
        property: "og:description",
        content: "One provider for your community’s connected services.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(resourcesQuery),
    ]),
  component: Home,
});
const PROCESS = [
  [
    "Get to know your community",
    "We walk the site, listen to your team and map the network you have today.",
    "Site survey",
  ],
  [
    "Make a clear plan",
    "A considered network design and quote, aligned with your buildings and the people in them.",
    "Design & quote",
  ],
  [
    "Connect. Then stay connected.",
    "Staged installation, a careful handover and ongoing support from the team that knows your site.",
    "Install & support",
  ],
];
function Home() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: resources } = useSuspenseQuery(resourcesQuery);
  const news = resources.filter((r) => r.kind !== "faq").slice(0, 3);
  const faqs = resources.filter((r) => r.kind === "faq").slice(0, 4);
  return (
    <>
      <section className="a-home-hero">
        <Landscape />
        <div className="a-hero-wash" />
        <div className="a-container a-home-hero-content">
          <Reveal>
            <span className="a-label a-label-glass">Australian owned. Community focused.</span>
            <h1>
              A little more connected.
              <br />
              <em>A lot more living.</em>
            </h1>
            <p>
              Internet, television, telephone and safety technology.
              <br className="a-desktop-break" /> Thoughtfully connected for retirement and care
              communities.
            </p>
            <div className="a-hero-buttons">
              <Link to="/services" className="a-button">
                Explore our services{" "}
                <span>
                  <ArrowUpRight size={20} />
                </span>
              </Link>
              <Link to="/contact" className="a-button a-button-glass">
                Talk to our team
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="a-hero-baseline a-container">
          <span>Connecting communities since 2004</span>
          <a href="#why-acsess">Discover the Acsess difference ↓</a>
        </div>
      </section>
      <Section className="a-introduction">
        <div id="why-acsess" className="a-centered-heading">
          <SectionHeading
            eyebrow="The Acsess difference"
            title="One team behind every connection."
            intro="Life in your community is complicated enough. Your connected services don’t need to be. We bring the infrastructure, everyday services and support together."
          />
        </div>
        <div className="a-facts">
          <div>
            <span>Since</span>
            <strong>2004</strong>
            <p>Connecting Australian communities</p>
          </div>
          <div>
            <span>From the ground up</span>
            <strong>One team</strong>
            <p>Design, installation & ongoing care</p>
          </div>
          <div>
            <span>For your everyday</span>
            <strong>Real people</strong>
            <p>Support that speaks your language</p>
          </div>
        </div>
      </Section>
      <Section muted className="a-home-services">
        <div className="a-centered-heading">
          <SectionHeading
            eyebrow="Connected services"
            title="Everything works better together."
            intro="From a video call with family to the systems your staff rely on. One connected approach, built around your community."
          />
        </div>
        <div className="a-service-grid">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
        <div className="a-center-action">
          <Link to="/services" className="a-button a-button-outline">
            Explore all services{" "}
            <span>
              <ArrowUpRight size={20} />
            </span>
          </Link>
        </div>
      </Section>
      <Section className="a-people-section">
        <div className="a-split">
          <div className="a-people-photo">
            <img src={MEDIA.hero} alt={MEDIA.heroAlt} loading="lazy" />
            <div className="a-photo-caption">
              <Headphones size={22} />
              <span>
                Someone who knows your name.
                <br />
                <strong>And your community.</strong>
              </span>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Made for people"
              title="Technology in the background. Life in the foreground."
              intro="A call with the grandkids. A favourite television programme. A team that can get on with caring. That’s what a good connection is really for."
            />
            <div className="a-audience-list">
              <details open>
                <summary>For residents</summary>
                <p>
                  Familiar services and patient, plain-language support. A connected home from the
                  day you move in.
                </p>
              </details>
              <details>
                <summary>For village operators</summary>
                <p>
                  One accountable partner for your infrastructure, services and resident support,
                  with visibility across your sites.
                </p>
              </details>
              <details>
                <summary>For developers</summary>
                <p>
                  Connectivity considered from the first drawings through staged commissioning and
                  handover.
                </p>
              </details>
            </div>
            <Link to="/retirement-living" className="a-text-link">
              Explore retirement living <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </Section>
      <Section muted className="a-process-section">
        <div className="a-centered-heading">
          <SectionHeading
            eyebrow="How we work"
            title="A clear path to better connected."
            intro="From the first conversation to the everyday questions, we take care of the whole journey."
          />
        </div>
        <ol className="a-process">
          {PROCESS.map(([title, body, label], i) => (
            <li key={title}>
              <span className="a-step-number">0{i + 1}</span>
              <p className="a-step-label">{label}</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section className="a-product-section">
        <div className="a-product-feature">
          <div>
            <span className="a-label">Small detail. Thoughtful design.</span>
            <h2>
              A little switch.
              <br />
              More peace of mind.
            </h2>
            <p>
              Meet SWITCH STAR. An Australian-designed double power outlet with an automatic cut-off
              timer, made for independent living.
            </p>
            <ul>
              <li>
                <Check size={18} />
                Automatic power cut-off
              </li>
              <li>
                <Check size={18} />
                Familiar double-outlet format
              </li>
              <li>
                <Check size={18} />
                Installed by a licensed electrician
              </li>
            </ul>
            <Link to="/switchstar" className="a-button">
              Meet SWITCH STAR{" "}
              <span>
                <ArrowUpRight size={20} />
              </span>
            </Link>
          </div>
          <div className="a-product-photo">
            <span>SWITCH STAR / ACSESS HEALTH</span>
            <img src={MEDIA.switchStar} alt={MEDIA.switchStarAlt} loading="lazy" />
          </div>
        </div>
      </Section>
      <Section muted className="a-support-section">
        <div className="a-support-feature">
          <div>
            <span className="a-label">Acsess, at your service</span>
            <h2>
              A human answer.
              <br />
              Whenever you need a hand.
            </h2>
            <p>
              Your services and support requests, together in your account. Or pick up the phone and
              speak with our team.
            </p>
            <div className="a-hero-buttons">
              <Link to="/account" className="a-button">
                Your account{" "}
                <span>
                  <ArrowUpRight size={20} />
                </span>
              </Link>
              <a href={CONTACT.phoneHref} className="a-text-link">
                {CONTACT.phone}
                <ArrowUpRight size={20} />
              </a>
            </div>
          </div>
          <div className="a-support-links">
            {[
              [Wifi, "Internet & Wi-Fi"],
              [Tv, "Television"],
              [Phone, "Telephone"],
              [Headphones, "Something else"],
            ].map(([Icon, title]) => {
              const ServiceIcon = Icon as typeof Wifi;
              return (
                <Link key={String(title)} to="/support">
                  <ServiceIcon size={22} />
                  <span>{String(title)}</span>
                  <ArrowUpRight size={20} />
                </Link>
              );
            })}
          </div>
        </div>
      </Section>
      {news.length > 0 && (
        <Section className="a-news-section">
          <div className="a-heading-row">
            <SectionHeading
              eyebrow="From our community"
              title="A little knowledge goes a long way."
            />
            <Link to="/resources" className="a-text-link">
              All resources <ArrowUpRight size={20} />
            </Link>
          </div>
          <div className="a-news-grid">
            {news.map((item, i) => (
              <article className="a-news-card" key={item.id}>
                <span className="a-news-index">
                  0{i + 1} / {item.kind}
                </span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                {item.external_url ? (
                  <a
                    href={item.external_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="a-text-link"
                  >
                    Read article <ArrowUpRight size={20} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link to="/resources" className="a-text-link">
                    Read more <ArrowUpRight size={20} />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}
      {faqs.length > 0 && (
        <Section className="a-faq-section">
          <div className="a-faq-layout">
            <SectionHeading
              eyebrow="A few useful answers"
              title="Let’s make things simple."
              intro="The questions we hear from residents and community teams."
            />
            <div className="a-faq-list">
              {faqs.map((faq) => (
                <details key={faq.id}>
                  <summary>{faq.title}</summary>
                  <div>
                    {(faq.body ?? faq.excerpt ?? "").split("\n\n").map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
