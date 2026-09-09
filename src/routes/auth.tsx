import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrganisations, useRoles } from "@/hooks/usePortalAccess";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { Logo } from "@/components/site/Logo";
import { MEDIA } from "@/lib/media";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Welcome — Acsess Health" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthPage,
});
type Mode = "signin" | "signup" | "reset";
function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("customer");
  const { session, loading } = useAuth();
  const { roles, loading: rolesLoading } = useRoles();
  const { organisations, loading: orgLoading } = useMyOrganisations();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && session && !rolesLoading && !orgLoading) {
      const destination =
        area === "customer"
          ? "/account"
          : roles.includes("admin")
            ? "/admin"
            : roles.includes("staff")
              ? "/staff"
              : roles.includes("operator") || organisations.some((o) => o.kind === "operator")
                ? "/operator"
                : organisations.some((o) => o.kind === "developer")
                  ? "/developer"
                  : "/account";
      void navigate({ to: destination });
    }
  }, [loading, session, rolesLoading, orgLoading, roles, organisations, area, navigate]);
  const submit = async (form: HTMLFormElement) => {
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: String(new FormData(form).get("name") ?? "").trim() },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("If an account exists, a reset link is on its way.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="portal p-login">
      <div className="p-login-art">
        <img className="p-login-art-image" src={MEDIA.village} alt={MEDIA.villageAlt} />
        <Logo className="p-brand p-dashboard-logo" />
        <div className="p-login-story">
          <span className="p-login-eyebrow">A MORE CONNECTED EVERYDAY</span>
          <h1>
            Everything connected.
            <br />
            <span>Simply yours.</span>
          </h1>
          <p>
            A single place for your services, your people, and the conversations that keep you
            connected.
          </p>
        </div>
        <div className="p-login-art-footer">
          <span>Designed around people.</span>
          <span>Australia</span>
        </div>
      </div>
      <div className="p-login-form-side">
        <div className="p-login-form-nav">
          <Logo className="p-login-mobile-logo" />
          <Link to="/" className="p-login-back">
            <ArrowLeft size={15} />
            Back to Acsess
          </Link>
        </div>
        <div className="p-login-form">
          <div className="p-login-form-heading">
            <span className="p-login-eyebrow">YOUR ACSESS ACCOUNT</span>
            <h2>
              {mode === "signin"
                ? "Welcome back."
                : mode === "signup"
                  ? "Make a connection."
                  : "Let’s get you back in."}
            </h2>
            <p>
              {mode === "signin"
                ? "A little less to manage. A lot more connected."
                : mode === "signup"
                  ? "Your services and support, together in one account."
                  : "We’ll email you a link to reset your password."}
            </p>
          </div>
          {mode === "signin" && (
            <div className="p-segments p-login-segments">
              {[
                { value: "customer", label: "Personal account" },
                { value: "work", label: "Work account" },
              ].map((v) => (
                <button
                  key={v.value}
                  aria-pressed={area === v.value}
                  onClick={() => setArea(v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <form
            className="p-form"
            onSubmit={(e) => {
              e.preventDefault();
              void submit(e.currentTarget);
            }}
          >
            {mode === "signup" && (
              <label className="p-field">
                Full name
                <input
                  className="p-input"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={120}
                  placeholder="Your name"
                />
              </label>
            )}
            <label className="p-field">
              Email address
              <input
                className="p-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            {mode !== "reset" && (
              <label className="p-field">
                <span className="p-password-label">
                  Password
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("reset")}>
                      Forgot password?
                    </button>
                  )}
                </span>
                <span className="p-password-input">
                  <input
                    className="p-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    minLength={mode === "signup" ? 8 : 1}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
            )}
            <button type="submit" className="p-button p-login-submit" disabled={busy}>
              {busy
                ? "One moment…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
              <ArrowRight size={16} />
            </button>
          </form>
          {mode === "signin" && (
            <>
              <div className="p-login-divider">
                <span />
                or
                <span />
              </div>
              <button
                className="p-button p-button-secondary p-google-button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: { redirectTo: `${window.location.origin}/auth` },
                    });
                    if (error) throw error;
                  } catch {
                    toast.error("Google sign-in couldn’t start. Please try again.");
                    setBusy(false);
                  }
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.9-1.8-5.7-4.1H3v2.6A10 10 0 0 0 12 22ZM6.3 14a6 6 0 0 1 0-4V7.4H3a10 10 0 0 0 0 9.2L6.3 14ZM12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.4L6.3 10A6 6 0 0 1 12 5.9Z"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}
          <p className="p-login-mode">
            {mode === "signin" ? "New to Acsess?" : "Already have an account?"}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          {mode === "signin" && (
            <details className="p-demo-options">
              <summary>Explore a demo account</summary>
              <p>Choose a sample workspace to fill the sign-in details.</p>
              <div>
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => {
                      setEmail(a.email);
                      setPassword(a.password);
                      setArea(a.key === "customer" ? "customer" : "work");
                    }}
                  >
                    {a.label}
                    <ArrowUpRight size={12} />
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
        <div className="p-login-legal">
          <LockKeyhole size={12} />
          Secure access to your Acsess workspace
        </div>
      </div>
    </div>
  );
}
