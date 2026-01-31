import { useDashboard } from "./DashboardLayout";
import { ApisPage } from "./ApisPage";

export default function DashboardApis() {
  const { connectedDatabase } = useDashboard();

  return <ApisPage connectedDatabase={connectedDatabase} />;
}
