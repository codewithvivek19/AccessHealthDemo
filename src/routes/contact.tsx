import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import { submitEnquiry } from "@/lib/content.functions";
import { PageHero, Section } from "@/components/site/Prose";
import { CONTACT } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Acsess Health" },
      {
        name: "description",
        content:
          "Talk to Acsess Health about connectivity for your retirement village, aged care home or healthcare community. Call 1300 736 785 or send us an enquiry.",
      },
      { property: "og:title", content: "Contact Acsess Health" },
      {
        property: "og:description",
        content: "Talk to us about connectivity for your community.",
      },
    ],
  }),
  component: Contact,
});

const field =
  "mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-lg outline-none transition-colors focus-visible:border-primary";

function Contact() {
  const send = useServerFn(submitEnquiry);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await send({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          organisation: String(fd.get("organisation") ?? ""),
          audience: String(fd.get("audience") ?? ""),
          topic: String(fd.get("topic") ?? ""),
          message: String(fd.get("message") ?? ""),
        },
      });
      form.reset();
      setSent(true);
      toast.success("Thanks — we've received your enquiry.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please call us instead.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Every good connection starts with a conversation."
        intro="Whether you're planning a new village, replacing ageing infrastructure or simply need help with a service at home, we'd like to hear from you."
      />

      <Section className="a-contact-section">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold">Direct contact</h2>
            <div className="mt-6 space-y-5 text-lg">
              <a
                href={CONTACT.phoneHref}
                className="flex items-center gap-3 font-medium hover:text-primary"
              >
                <Phone className="size-5 text-primary" aria-hidden />
                {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <Mail className="size-5 text-primary" aria-hidden />
                {CONTACT.email}
              </a>
              <p className="text-muted-foreground">{CONTACT.hours}</p>
            </div>
            <div className="mt-10 rounded-sm border border-border bg-secondary p-7">
              <h3 className="text-lg font-semibold">Already a customer?</h3>
              <p className="mt-2 text-muted-foreground">
                Sign in to your account to log a support request and track its progress.
              </p>
              <Link to="/account/support" className="a-text-link mt-5">
                Open your support requests ↗
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Send an enquiry</h2>
            {sent && (
              <p
                role="status"
                className="mt-4 rounded-sm border border-primary/40 bg-primary/5 p-4 text-lg"
              >
                Thanks — your enquiry is with our team and we'll be in touch shortly.
              </p>
            )}
            <form onSubmit={onSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-lg font-medium">
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    className={field}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-lg font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={field}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-lg font-medium">
                    Phone <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input id="phone" name="phone" className={field} autoComplete="tel" />
                </div>
                <div>
                  <label htmlFor="organisation" className="text-lg font-medium">
                    Village or organisation{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input id="organisation" name="organisation" className={field} />
                </div>
              </div>

              <div>
                <label htmlFor="audience" className="text-lg font-medium">
                  I am a
                </label>
                <select id="audience" name="audience" className={field} defaultValue="Resident">
                  <option>Resident</option>
                  <option>Village or care operator</option>
                  <option>Builder or developer</option>
                  <option>Someone else</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="text-lg font-medium">
                  How can we help?
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={5}
                  rows={6}
                  className={field}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center rounded-sm bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          </div>
        </div>
      </Section>
    </>
  );
}
