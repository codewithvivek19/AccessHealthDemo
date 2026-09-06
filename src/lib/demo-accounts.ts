export type DemoAccount = {
  key: "customer" | "operator" | "employee";
  label: string;
  email: string;
  password: string;
  blurb: string;
  destination: string;
};

/** Shared demo password for the sample sign-ins. */
export const DEMO_PASSWORD = "AcsessDemo123!";

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    key: "customer",
    label: "Customer",
    email: "customer@acsessdemo.com",
    password: DEMO_PASSWORD,
    blurb: "A village resident — services, support requests and documents.",
    destination: "/account",
  },
  {
    key: "operator",
    label: "Operator",
    email: "operator@acsessdemo.com",
    password: DEMO_PASSWORD,
    blurb: "A village operator — sites, requests and reporting.",
    destination: "/operator",
  },
  {
    key: "employee",
    label: "Employee",
    email: "employee@acsessdemo.com",
    password: DEMO_PASSWORD,
    blurb: "An Acsess team member — support desk and enquiries.",
    destination: "/staff",
  },
] as const;
