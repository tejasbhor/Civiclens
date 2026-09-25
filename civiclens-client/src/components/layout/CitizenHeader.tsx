import { PortalHeader } from "./PortalHeader";

export const CitizenHeader = () => (
  <PortalHeader
    portal="Citizen"
    home="/citizen/dashboard"
    nav={[
      { to: "/citizen/dashboard", label: "Dashboard" },
      { to: "/citizen/reports", label: "My reports" },
    ]}
    notificationsRoute="/citizen/notifications"
    profileRoute="/citizen/profile"
  />
);
