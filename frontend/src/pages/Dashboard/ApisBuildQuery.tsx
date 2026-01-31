import { ApisContent } from "./ApisPage/ApisPage.styles";
import QueryBuilderImproved from "./ApisPage/QueryBuilder/QueryBuilderImproved";
import { useDashboard } from "./DashboardLayout";
import { useApisContext } from "./ApisLayout";

export default function ApisBuildQuery() {
  const { connectedDatabase } = useDashboard();
  const { triggerOpenApiRefresh } = useApisContext();

  if (!connectedDatabase) return null;

  return (
    <ApisContent>
      <QueryBuilderImproved
        connectedDatabase={connectedDatabase}
        onApiSaved={triggerOpenApiRefresh}
      />
    </ApisContent>
  );
}
