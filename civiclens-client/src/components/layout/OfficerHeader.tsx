import { PortalHeader } from "./PortalHeader";

interface OfficerHeaderProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const OfficerHeader = ({ onRefresh, refreshing = false }: OfficerHeaderProps) => (
  <PortalHeader
    portal="Officer"
    home="/officer/dashboard"
    nav={[
      { to: "/officer/dashboard", label: "Dashboard" },
      { to: "/officer/tasks", label: "Tasks" },
    ]}
    notificationsRoute="/officer/notifications"
    profileRoute="/officer/profile"
    onRefresh={onRefresh}
    refreshing={refreshing}
  />
);
