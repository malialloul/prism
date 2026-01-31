import { ApisContent } from "./ApisPage/ApisPage.styles";
import { OpenApiPanel } from "./ApisPage/OpenApiPanel";
import { useDashboard } from "./DashboardLayout";
import { useApisContext } from "./ApisLayout";

export default function ApisOpenApi() {
  const { connectedDatabase } = useDashboard();
  const { openApiRefreshKey } = useApisContext();

  if (!connectedDatabase) return null;

  return (
    <ApisContent key={openApiRefreshKey}>
      <OpenApiPanel connectedDatabase={connectedDatabase} />
    </ApisContent>
  );
}
