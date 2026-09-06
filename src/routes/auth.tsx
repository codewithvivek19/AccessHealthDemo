import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MEDIA } from "@/lib/media";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/lib/demo-accounts";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Acsess Health account" },
      {
        name: "description",
        content:
          "Sign in to your Acsess Health account to view your services, log support requests and find your documents.",
      },
      { property: "og:title", content: "Sign in — Acsess Health account" },
      {
        property: "og:description",
        content: "Manage your Acsess services, support requests and documents.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "reset";

const glassField =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-3.5 text-base backdrop-blur-sm transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background";

const testimonials = [
  {
    name: "Village manager",
    handle: "Retirement community, QLD",
    text: "One number to call for internet, TV and phones — and they actually answer. It has taken a real load off our team.",
  },
  {
    name: "Resident",
    handle: "Acsess-connected village",
    text: "The internet just works, and when my phone line needed a hand, someone was onto it the same day.",
  },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<DemoAccount["key"]>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const account = DEMO_ACCOUNTS.find((a) => a.key === role)!;

  useEffect(() => {
    if (!loading && session) navigate({ to: account.destination });
  }, [loading, session, navigate, account.destination]);

  function useDemoAccount() {
    setEmail(account.email);
    setPassword(account.password);
    setMode("signin");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: account.destination });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: String(fd.get("full_name") ?? "") },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm it.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("If that email is registered, a reset link is on its way.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-5 py-10 md:min-h-[calc(100vh-5rem)] lg:px-8">
      <div className="grid w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-2">
        {/* Left column: form */}
        <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="auth-fade-slide w-full max-w-md">
            <p className="eyebrow text-primary">Your account</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {mode === "signup"
                ? "Create your account"
                : mode === "reset"
                  ? "Reset your password"
                  : "Welcome back"}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {mode === "signup"
                ? "One account for your services, support requests and documents."
                : mode === "reset"
                  ? "Enter your email and we'll send you a reset link."
                  : "Sign in to see your services, support requests and documents. For residents, village teams and staff."}
            </p>

            <div className="mt-7">
              <p className="mb-2 text-sm font-medium">I'm signing in as</p>
              <div
                role="tablist"
                aria-label="Account type"
                className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/50 p-1"
              >
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.key}
                    role="tab"
                    type="button"
                    aria-selected={role === a.key}
                    onClick={() => setRole(a.key)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      role === a.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{account.blurb}</p>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              {mode === "signup" && (
                <div>
                  <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className={glassField}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={glassField}
                />
              </div>

              {mode !== "reset" && (
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder="Enter your password"
                      className={`${glassField} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <p className="mt-2 text-sm text-muted-foreground">At least 8 characters.</p>
                  )}
                </div>
              )}

              {mode === "signin" && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      name="remember"
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    Keep me signed in
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="font-medium text-primary transition-colors hover:underline"
                  >
                    Reset password
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-60"
              >
                {busy
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "reset"
                      ? "Send reset link"
                      : "Sign in"}
              </button>
            </form>

            {mode === "signin" && (
              <>
                <div className="mt-7 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="hairline flex-1" />
                  Or continue with
                  <span className="hairline flex-1" />
                </div>
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-3.5 text-base font-medium transition-colors hover:bg-muted"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </>
            )}

            <div className="mt-7 rounded-2xl border border-dashed border-border bg-muted/40 p-5">
              <p className="text-sm font-semibold">Demo sign-in — {account.label}</p>
              <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0">Email</dt>
                  <dd className="font-mono break-all text-foreground">{account.email}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0">Password</dt>
                  <dd className="font-mono text-foreground">{account.password}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={useDemoAccount}
                className="mt-4 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Fill these details
              </button>
            </div>


            <div className="mt-7 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  New to Acsess Health?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-medium text-primary transition-colors hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-medium text-primary transition-colors hover:underline"
                >
                  Back to sign in
                </button>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Prefer to talk?{" "}
              <Link to="/support" className="font-medium text-primary hover:underline">
                Visit the support page
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Right column: hero image + testimonials */}
        <div className="ink-section relative hidden min-h-[560px] lg:block">
          <img
            src={MEDIA.technician}
            alt={MEDIA.technicianAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          <div className="absolute right-8 bottom-8 left-8 space-y-4">
            {testimonials.map((t, i) => (
              <figure
                key={t.name + i}
                className="auth-testimonial rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md"
                style={{ animationDelay: `${300 + i * 200}ms` }}
              >
                <blockquote className="text-sm leading-relaxed text-ink-foreground">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-3">
                  <p className="text-sm font-semibold text-ink-foreground">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.handle}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
