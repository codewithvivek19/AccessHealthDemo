import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Headphones,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Wifi,
  MapPin,
  Clock,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import village from "@/assets/hero-retirement-connected.jpg";
import "../demo-portal.css";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Your everyday, connected — Acsess demo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoPortal,
});
const tabs = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "My services", icon: Wifi },
  { name: "Bills & payments", icon: CreditCard },
  { name: "My requests", icon: MessageSquare },
  { name: "My details", icon: Users },
];
const services = [
  {
    name: "Village Internet",
    plan: "Everyday 100",
    detail: "100 / 20 Mbps · Unlimited data",
    price: 69,
    icon: Wifi,
    number: "AC-IN-10482",
  },
  {
    name: "Home Phone",
    plan: "Stay Connected",
    detail: "Local & national calls included",
    price: 15,
    icon: Phone,
    number: "03 9123 4567",
  },
];
const bills = ["September", "August", "July", "June", "May", "April"].map((month, i) => ({
  month,
  id: `INV-2026-${String(9 - i).padStart(2, "0")}-10482`,
  date: `01 ${month} 2026`,
  status: i ? "Paid" : "Scheduled",
  amount: 84,
}));
type Request = {
  id: string;
  title: string;
  category: string;
  detail: string;
  date: string;
  status: string;
};
const initialRequests: Request[] = [
  {
    id: "AC-2041",
    title: "A little help with my Wi-Fi",
    category: "Technical support",
    detail: "The connection in the study drops occasionally. A callback has been requested.",
    date: "18 Sep 2026",
    status: "In review",
  },
  {
    id: "AC-2018",
    title: "My phone package",
    category: "Change phone package",
    detail: "Your request was reviewed by the Acsess team. Your current package is Stay Connected.",
    date: "12 Sep 2026",
    status: "Completed",
  },
];

function DemoPortal() {
  const [tab, setTab] = useState("Overview");
  const [workspace, setWorkspace] = useState("Customer");
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState(false);
  const [query, setQuery] = useState("");
  const [requests, setRequests] = useState(initialRequests);
  const [modal, setModal] = useState<"request" | "payment" | "bill" | "detail" | null>(null);
  const [category, setCategory] = useState("Technical support");
  const [selected, setSelected] = useState<Request>(initialRequests[0]!);
  const [bill, setBill] = useState(bills[0]!);
  const [confirmation, setConfirmation] = useState("");
  const [filter, setFilter] = useState("All requests");
  const [assigned, setAssigned] = useState<string[]>([]);
  const go = (name: string) => {
    setTab(name);
    setQuery("");
    setMenu(false);
  };
  const request = (type = "Technical support") => {
    setCategory(type);
    setConfirmation("");
    setModal("request");
  };
  const staff = workspace !== "Customer";
  const nav = staff
    ? [
        { name: "Overview", icon: LayoutDashboard },
        { name: "Work queue", icon: MessageSquare },
        { name: "Customer accounts", icon: Users },
        { name: "Villages", icon: Building2 },
      ]
    : tabs;
  const matching = requests.filter(
    (r) =>
      (filter !== "Open" || r.status !== "Completed") &&
      (filter !== "Completed" || r.status === "Completed") &&
      `${r.title} ${r.id} ${r.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="ac-demo">
      {menu && (
        <button className="ac-scrim" aria-label="Close navigation" onClick={() => setMenu(false)} />
      )}
      <aside className={`ac-sidebar ${menu ? "is-open" : ""}`}>
        <Logo className="ac-logo" />
        <div className="ac-workspace">
          <span className="ac-avatar">{staff ? "AT" : "MT"}</span>
          <div>
            <strong>{staff ? "Acsess team" : "Margaret Thompson"}</strong>
            <span>{staff ? "Operations workspace" : "Personal account"}</span>
          </div>
        </div>
        <label className="ac-workspace-select">
          EXPLORE THE DEMO
          <select
            value={workspace}
            onChange={(e) => {
              setWorkspace(e.target.value);
              go("Overview");
            }}
          >
            <option>Customer</option>
            <option>Employee</option>
            <option>Village operator</option>
            <option>Super admin</option>
          </select>
        </label>
        <span className="ac-nav-label">{staff ? "YOUR WORKSPACE" : "YOUR EVERYDAY"}</span>
        <nav aria-label="Demo navigation">
          {nav.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => go(name)}
              aria-current={tab === name ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "My requests" && (
                <b>{requests.filter((r) => r.status !== "Completed").length}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="ac-sidebar-help">
          <span className="ac-help-icon">
            <Headphones size={23} />
          </span>
          <h3>
            A familiar voice.
            <br />A helping hand.
          </h3>
          <p>We’re here to make things simple.</p>
          <a href="tel:1300736785">
            1300 736 785 <ArrowUpRight size={16} />
          </a>
          <button onClick={() => request("Request a callback")}>
            Request a callback <ArrowRight size={15} />
          </button>
        </div>
        <a className="ac-back-site" href="/">
          Back to Acsess website <ArrowUpRight size={15} />
        </a>
      </aside>
      <div className="ac-main">
        <header className="ac-topbar">
          <div className="ac-breadcrumb">
            <button
              className="ac-menu ac-icon"
              onClick={() => setMenu(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </button>
            <span>{staff ? workspace : "My account"}</span>
            <ChevronRight size={14} />
            <strong>{tab}</strong>
          </div>
          <div className="ac-top-actions">
            <span className="ac-demo-tag">INTERACTIVE DEMO</span>
            <button
              className="ac-icon"
              aria-label="Notifications"
              aria-expanded={notice}
              onClick={() => setNotice(!notice)}
            >
              <Bell size={19} />
              <i />
            </button>
            <span className="ac-avatar">{staff ? "AT" : "MT"}</span>
          </div>
        </header>
        {notice && (
          <div className="ac-notifications">
            <strong>Your updates</strong>
            <p>
              <CheckCircle2 size={18} /> September bill is ready to view.
            </p>
            <p>
              <MessageSquare size={18} /> Your Wi-Fi request is in review.
            </p>
            <button
              onClick={() => {
                go("My requests");
                setWorkspace("Customer");
                setNotice(false);
              }}
            >
              View your requests <ArrowRight size={15} />
            </button>
          </div>
        )}
        <main className="ac-content">
          <div className="ac-heading">
            <div>
              <span className="ac-eyebrow">
                {staff ? "CONNECTED TEAMS. BETTER SERVICE." : "A LITTLE MORE CONNECTED."}
              </span>
              <h1>
                {tab === "Overview" ? (staff ? "Everything in view." : "Hello, Margaret.") : tab}
              </h1>
              <p>
                {staff
                  ? "Your people, places and next steps. All together."
                  : tab === "Overview"
                    ? "Welcome home. Let’s make your everyday a little simpler."
                    : "Your account, with everything in the right place."}
              </p>
            </div>
            <button className="ac-button" onClick={() => request()}>
              <Plus size={17} /> New request
            </button>
          </div>
          {staff ? (
            <>
              <div className="ac-metrics">
                {[
                  [
                    "Open requests",
                    requests.filter((r) => r.status !== "Completed").length,
                    "Ready for your team",
                  ],
                  ["Customer accounts", "248", "Across 6 communities"],
                  ["Assigned to me", assigned.length, "Your focus for today"],
                ].map(([label, value, hint]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{hint}</small>
                  </div>
                ))}
              </div>
              {tab === "Customer accounts" ? (
                <section className="ac-panel">
                  <div className="ac-panel-head">
                    <h2>People behind the accounts</h2>
                    <span className="ac-pill">Sample records</span>
                  </div>
                  {["Margaret Thompson", "David Wilson", "Anne Mitchell"].map((name, i) => (
                    <button
                      className="ac-list-row"
                      key={name}
                      onClick={() => {
                        setWorkspace("Customer");
                        go("Overview");
                      }}
                    >
                      <span className="ac-avatar">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <div>
                        <strong>{name}</strong>
                        <p>
                          {i
                            ? "Demonstration account · Opens Margaret’s sample view"
                            : "AC-10482 · Willowbrook Village · 2 services"}
                        </p>
                      </div>
                      <ArrowUpRight size={18} />
                    </button>
                  ))}
                </section>
              ) : tab === "Villages" ? (
                <section className="ac-community">
                  <img src={village} alt="A connected retirement community" />
                  <div>
                    <span className="ac-eyebrow">COMMUNITY SPOTLIGHT</span>
                    <h2>Willowbrook Village</h2>
                    <p>84 homes. One connected community.</p>
                    <span className="ac-pill">Sample service status: operational</span>
                    <button className="ac-button" onClick={() => go("Work queue")}>
                      View community requests <ArrowRight size={16} />
                    </button>
                  </div>
                </section>
              ) : (
                <section className="ac-panel">
                  <div className="ac-panel-head">
                    <div>
                      <h2>Your service desk</h2>
                      <p>Small actions. A better day for someone.</p>
                    </div>
                    <span className="ac-pill">Demo workflow</span>
                  </div>
                  {requests.map((r) => (
                    <div className="ac-list-row" key={r.id}>
                      <span className="ac-tile-icon">
                        <MessageSquare size={20} />
                      </span>
                      <div>
                        <strong>{r.title}</strong>
                        <p>{r.id} · Margaret Thompson · Willowbrook</p>
                      </div>
                      <span className="ac-pill">{r.status}</span>
                      <button
                        className="ac-button ac-secondary"
                        disabled={assigned.includes(r.id) || r.status === "Completed"}
                        onClick={() => setAssigned([...assigned, r.id])}
                      >
                        {assigned.includes(r.id) ? "Assigned to you" : "Assign to me"}
                      </button>
                      <button
                        className="ac-icon"
                        aria-label={`Open ${r.id}`}
                        onClick={() => {
                          setSelected(r);
                          setModal("detail");
                        }}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  ))}
                </section>
              )}
              <div className="ac-note">
                <ShieldCheck size={20} />
                <p>Workspace preview · Sample records and assignments stay in this demo session.</p>
              </div>
            </>
          ) : (
            <>
              {tab === "Overview" && (
                <>
                  <section className="ac-hero">
                    <div>
                      <span className="ac-hero-label">
                        <span /> CONNECTED TO THE EVERYDAY
                      </span>
                      <h2>
                        Less to manage.
                        <br />
                        <em>More to enjoy.</em>
                      </h2>
                      <p>
                        Your internet, your calls, your community.
                        <br />
                        We’ll take care of the connections.
                      </p>
                      <button onClick={() => go("My services")}>
                        Explore your services <ArrowUpRight size={18} />
                      </button>
                    </div>
                    <img
                      src={village}
                      alt="Residents enjoying life in their retirement community"
                    />
                    <div className="ac-hero-location">
                      <MapPin size={15} /> Willowbrook Village
                    </div>
                  </section>
                  <div className="ac-metrics">
                    <button onClick={() => go("My services")}>
                      <span>
                        Your services <Wifi size={18} />
                      </span>
                      <strong>
                        02 <small>active services</small>
                      </strong>
                      <small>
                        Internet & home phone <ArrowUpRight size={15} />
                      </small>
                    </button>
                    <button onClick={() => go("Bills & payments")}>
                      <span>
                        Next direct debit <CreditCard size={18} />
                      </span>
                      <strong>
                        $84<small>.00 AUD</small>
                      </strong>
                      <small>
                        Scheduled for 25 September <ArrowUpRight size={15} />
                      </small>
                    </button>
                    <button onClick={() => go("My requests")}>
                      <span>
                        We’re on it <MessageSquare size={18} />
                      </span>
                      <strong>
                        {String(requests.filter((r) => r.status !== "Completed").length).padStart(
                          2,
                          "0",
                        )}{" "}
                        <small>open requests</small>
                      </strong>
                      <small>
                        Follow every step <ArrowUpRight size={15} />
                      </small>
                    </button>
                  </div>
                  <div className="ac-columns">
                    <section className="ac-panel">
                      <div className="ac-panel-head">
                        <div>
                          <h2>Your connections</h2>
                          <p>Everyday essentials, taken care of.</p>
                        </div>
                        <button onClick={() => go("My services")}>
                          View all <ArrowUpRight size={16} />
                        </button>
                      </div>
                      {services.map((s) => (
                        <button
                          key={s.name}
                          className="ac-list-row"
                          onClick={() => go("My services")}
                        >
                          <span className="ac-tile-icon">
                            <s.icon size={23} />
                          </span>
                          <div>
                            <strong>{s.name}</strong>
                            <p>{s.plan}</p>
                          </div>
                          <span className="ac-price">
                            ${s.price}
                            <small>/mo</small>
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </section>
                    <section className="ac-support-card">
                      <span className="ac-eyebrow">GOOD PEOPLE. REAL SUPPORT.</span>
                      <Headphones size={33} strokeWidth={1.3} />
                      <h2>
                        Let’s figure it
                        <br />
                        out together.
                      </h2>
                      <p>A question, a change, or a little help getting connected.</p>
                      <button onClick={() => request()}>
                        Talk to your Acsess team <ArrowUpRight size={18} />
                      </button>
                    </section>
                  </div>
                </>
              )}
              {tab === "My services" && (
                <>
                  <div className="ac-address">
                    <MapPin size={19} />
                    <div>
                      <strong>Unit 24, Willowbrook Village</strong>
                      <span>12 Garden Avenue, Melbourne VIC · Sample address</span>
                    </div>
                    <span className="ac-pill">Your home</span>
                  </div>
                  <div className="ac-service-grid">
                    {services.map((s) => (
                      <section className="ac-service-card" key={s.name}>
                        <div className="ac-service-top">
                          <span className="ac-tile-icon">
                            <s.icon size={28} />
                          </span>
                          <span className="ac-pill">
                            <span className="ac-dot" /> Active
                          </span>
                        </div>
                        <p className="ac-eyebrow">{s.name}</p>
                        <h2>{s.plan}</h2>
                        <p>{s.detail}</p>
                        <div className="ac-service-cost">
                          ${s.price}
                          <span>.00 / month</span>
                        </div>
                        <dl>
                          <div>
                            <dt>Service reference</dt>
                            <dd>{s.number}</dd>
                          </div>
                          <div>
                            <dt>Billing cycle</dt>
                            <dd>Monthly</dd>
                          </div>
                          <div>
                            <dt>Connected since</dt>
                            <dd>12 March 2024</dd>
                          </div>
                        </dl>
                        <button
                          className="ac-button"
                          onClick={() =>
                            request(
                              s.icon === Wifi ? "Change internet plan" : "Change phone package",
                            )
                          }
                        >
                          Request a plan change <ArrowUpRight size={16} />
                        </button>
                        <button
                          className="ac-text-button"
                          onClick={() => request(`Help with ${s.name}`)}
                        >
                          Get help with this service
                        </button>
                      </section>
                    ))}
                  </div>
                  <div className="ac-note">
                    <ShieldCheck size={22} />
                    <p>
                      <strong>You’re always in control.</strong> Plan changes are reviewed by our
                      team. Your existing service stays in place until the change is confirmed.
                    </p>
                  </div>
                </>
              )}
              {tab === "Bills & payments" && (
                <>
                  <div className="ac-columns">
                    <section className="ac-balance">
                      <span className="ac-eyebrow">YOUR SEPTEMBER BILL</span>
                      <h2>
                        $84<span>.00</span>
                      </h2>
                      <p>Direct debit scheduled · 25 September 2026</p>
                      <div>
                        <CheckCircle2 size={19} /> Nothing you need to do
                      </div>
                      <button
                        onClick={() => {
                          setBill(bills[0]!);
                          setModal("bill");
                        }}
                      >
                        View bill <ArrowUpRight size={17} />
                      </button>
                    </section>
                    <section className="ac-panel ac-payment">
                      <div className="ac-panel-head">
                        <h2>Your payment method</h2>
                        <ShieldCheck size={21} />
                      </div>
                      <div className="ac-bank">
                        <span className="ac-tile-icon">
                          <Building2 />
                        </span>
                        <div>
                          <strong>Bank account •••• 4821</strong>
                          <p>Margaret Thompson · Direct debit</p>
                        </div>
                      </div>
                      <p>Your full payment details are never shown here.</p>
                      <button
                        className="ac-button ac-secondary"
                        onClick={() => setModal("payment")}
                      >
                        Update payment details <ArrowUpRight size={16} />
                      </button>
                    </section>
                  </div>
                  <section className="ac-panel">
                    <div className="ac-panel-head">
                      <div>
                        <h2>Your bill history</h2>
                        <p>A clear record of your monthly services.</p>
                      </div>
                      <span className="ac-pill">2026 · AUD</span>
                    </div>
                    <div className="ac-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Invoice</th>
                            <th>Issued</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>
                              <span className="sr-only">Download</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.map((b) => (
                            <tr key={b.id}>
                              <td>
                                <strong>{b.month} services</strong>
                                <small>{b.id}</small>
                              </td>
                              <td>{b.date}</td>
                              <td>$84.00</td>
                              <td>
                                <span
                                  className={`ac-pill ${b.status === "Scheduled" ? "amber" : ""}`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="ac-icon"
                                  aria-label={`View ${b.month} sample bill`}
                                  onClick={() => {
                                    setBill(b);
                                    setModal("bill");
                                  }}
                                >
                                  <Download size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
              {tab === "My requests" && (
                <section className="ac-panel">
                  <div className="ac-panel-head">
                    <div>
                      <h2>A conversation, with a clear next step.</h2>
                      <p>Track the changes and support you’ve asked us for.</p>
                    </div>
                  </div>
                  <div className="ac-toolbar">
                    <div className="ac-tabs">
                      {["All requests", "Open", "Completed"].map((f) => (
                        <button
                          key={f}
                          aria-pressed={f === filter}
                          className={f === filter ? "active" : ""}
                          onClick={() => setFilter(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <label className="ac-search">
                      <Search size={17} />
                      <input
                        placeholder="Find a request…"
                        aria-label="Search requests"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  {matching.map((r) => (
                    <button
                      className="ac-list-row"
                      key={r.id}
                      onClick={() => {
                        setSelected(r);
                        setModal("detail");
                      }}
                    >
                      <span className="ac-tile-icon">
                        <MessageSquare size={20} />
                      </span>
                      <div>
                        <strong>{r.title}</strong>
                        <p>
                          {r.id} · {r.date}
                        </p>
                      </div>
                      <span className={`ac-pill ${r.status === "Completed" ? "" : "amber"}`}>
                        {r.status}
                      </span>
                      <ChevronRight size={17} />
                    </button>
                  ))}
                  {!matching.length && (
                    <div className="ac-empty">
                      <Search size={28} />
                      <h3>No matching requests</h3>
                      <p>Try another search or start a new request.</p>
                      <button className="ac-button" onClick={() => request()}>
                        New request
                      </button>
                    </div>
                  )}
                </section>
              )}
              {tab === "My details" && (
                <div className="ac-columns">
                  <section className="ac-panel ac-profile">
                    <div className="ac-profile-head">
                      <span className="ac-avatar">MT</span>
                      <div>
                        <h2>Margaret Thompson</h2>
                        <p>Account AC-10482</p>
                      </div>
                      <span className="ac-pill">Personal</span>
                    </div>
                    <dl>
                      {[
                        ["Email address", "margaret@example.com"],
                        ["Phone number", "0400 123 456"],
                        ["Service address", "Unit 24, Willowbrook Village"],
                        ["Postal address", "12 Garden Avenue, Melbourne VIC"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <button
                      className="ac-button ac-secondary"
                      onClick={() => request("Update contact details")}
                    >
                      Request a details update <ArrowUpRight size={16} />
                    </button>
                  </section>
                  <section className="ac-support-card">
                    <ShieldCheck size={32} />
                    <h2>
                      Your information.
                      <br />
                      Handled with care.
                    </h2>
                    <p>
                      Need to update something? Send us a request and our office will confirm when
                      it’s complete.
                    </p>
                    <button onClick={() => request("Request a callback")}>
                      Prefer to talk? Request a call <ArrowUpRight size={17} />
                    </button>
                  </section>
                </div>
              )}
            </>
          )}
          <footer className="ac-footer">
            <span>
              <span className="ac-dot" /> Thoughtfully connected. Acsess Health.
            </span>
            <span>Sample data · No live account changes</span>
          </footer>
        </main>
      </div>
      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent className="ac-dialog">
          <DialogTitle>
            {modal === "request"
              ? confirmation
                ? "You’re all set."
                : "How can we help?"
              : modal === "payment"
                ? "A safer way to update."
                : modal === "bill"
                  ? `${bill.month} bill`
                  : selected.title}
          </DialogTitle>
          <DialogDescription>
            {modal === "bill"
              ? "Sample invoice · Use Print to save a PDF for your demo."
              : "Interactive preview · Nothing is sent to Acsess or an external provider."}
          </DialogDescription>
          {modal === "request" &&
            (confirmation ? (
              <div className="ac-confirmation">
                <span>
                  <Check size={35} />
                </span>
                <h3>We’ve captured your demo request.</h3>
                <p>
                  Your reference is <strong>{confirmation}</strong>. It’s now in My requests, ready
                  for the team to review. Your account details have not changed.
                </p>
                <button
                  className="ac-button"
                  onClick={() => {
                    setWorkspace("Customer");
                    go("My requests");
                    setModal(null);
                  }}
                >
                  Track my request <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <form
                className="ac-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const id = `AC-${2042 + requests.length - initialRequests.length}`;
                  setRequests([
                    {
                      id,
                      title: category,
                      category,
                      detail: String(data.get("details")),
                      date: "Just now",
                      status: "Received",
                    },
                    ...requests,
                  ]);
                  setConfirmation(id);
                }}
              >
                <label>
                  What would you like to do?
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {Array.from(
                      new Set([
                        category,
                        "Technical support",
                        "Change internet plan",
                        "Change phone package",
                        "Update contact details",
                        "Request a callback",
                        "Payment details callback",
                      ]),
                    ).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Tell us a little more
                  <textarea
                    name="details"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="What would you like changed, or what do you need help with? Please don’t include payment details."
                  />
                </label>
                <div className="ac-note">
                  <Clock size={18} />
                  <p>
                    Our team reviews requests before applying changes. This demo saves the request
                    only while this page is open.
                  </p>
                </div>
                <button className="ac-button" type="submit">
                  Create demo request <ArrowRight size={17} />
                </button>
              </form>
            ))}
          {modal === "payment" && (
            <div className="ac-payment-preview">
              <span className="ac-tile-icon">
                <ShieldCheck size={32} />
              </span>
              <h3>Your details go directly to Ezidebit.</h3>
              <p>
                In the finished portal, this step opens Ezidebit’s secure form. The Acsess team then
                links the updated payment record to your account.
              </p>
              <div className="ac-provider">
                <span>ACSESS</span>
                <ArrowRight size={19} />
                <strong>Ezidebit</strong>
                <span>Secure hosted form</span>
              </div>
              <p className="ac-small">
                This preview does not open a payment form or collect card or bank details.
              </p>
              <button className="ac-button" onClick={() => request("Payment details callback")}>
                Request a payment callback <Phone size={16} />
              </button>
            </div>
          )}
          {modal === "bill" && (
            <div className="ac-invoice">
              <div>
                <strong>ACSESS HEALTH</strong>
                <span>SAMPLE INVOICE · NOT PAYABLE</span>
              </div>
              <p>
                {bill.id}
                <br />
                Issued {bill.date}
                <br />
                Margaret Thompson · AC-10482
              </p>
              {services.map((s) => (
                <div className="ac-invoice-line" key={s.name}>
                  <span>
                    {s.name} · {s.plan}
                  </span>
                  <strong>${s.price}.00</strong>
                </div>
              ))}
              <div className="ac-invoice-line">
                <strong>Total AUD</strong>
                <strong>$84.00</strong>
              </div>
              <p>Demonstration amounts only. This is not a tax invoice.</p>
              <button className="ac-button ac-print-button" onClick={() => window.print()}>
                <Download size={17} /> Print / save sample PDF
              </button>
            </div>
          )}
          {modal === "detail" && (
            <div className="ac-request-detail">
              <span className="ac-pill">
                {selected.id} · {selected.status}
              </span>
              <p>{selected.detail}</p>
              <ol>
                <li>
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>Request received</strong>
                    <p>{selected.date} · Your reference is ready.</p>
                  </div>
                </li>
                <li>
                  <Clock size={20} />
                  <div>
                    <strong>
                      {selected.status === "Received"
                        ? "Awaiting team review"
                        : "Reviewed by your Acsess team"}
                    </strong>
                    <p>We check the details before making changes.</p>
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>
                      {selected.status === "Completed" ? "Completed" : "Confirmation comes next"}
                    </strong>
                    <p>
                      {selected.status === "Completed"
                        ? "Your request has been completed."
                        : "Your existing service stays in place until confirmed."}
                    </p>
                  </div>
                </li>
              </ol>
              <button
                className="ac-button ac-secondary"
                onClick={() => request(`Follow up on ${selected.id}`)}
              >
                Ask about this request <ArrowRight size={16} />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
