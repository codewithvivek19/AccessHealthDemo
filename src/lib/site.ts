export const CONTACT = {
  phone: "1300 736 785",
  phoneHref: "tel:1300736785",
  email: "info@acsess.com.au",
  hours: "Monday to Friday, business hours (AEST)",
};

export const NAV = [
  { to: "/services", label: "Services" },
  { to: "/retirement-living", label: "Retirement living" },
  { to: "/switchstar", label: "SWITCH STAR" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
] as const;

export const ACCOUNT_NAV = [
  { to: "/account", label: "Overview", exact: true },
  { to: "/account/services", label: "My services" },
  { to: "/account/support", label: "Support" },
  { to: "/account/documents", label: "Documents" },
  { to: "/account/profile", label: "Profile" },
] as const;

export const PARTNERS = [
  "Foxtel",
  "Telstra",
  "NBN Co",
  "Lendlease",
  "Property Council of Australia",
  "Retirement Living Council",
];
