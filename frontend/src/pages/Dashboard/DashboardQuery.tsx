import { useNavigate } from "react-router-dom";
import { useDashboard } from "./DashboardLayout";
import {
  ContentHeader,
  ContentTitle,
  StyledTabs,
  StyledTab,
  TabPanel,
  TabsContainer,
} from "./Dashboard.styles";
import { QueryEditor } from "./QueryEditor";

export default function DashboardQuery() {
  const navigate = useNavigate();
  const {
    connectedDatabase,
    schemaVersion,
    initialQuery,
  } = useDashboard();

  // Redirect if no database connected
  if (!connectedDatabase) {
    return (
      <>
        <ContentHeader>
          <ContentTitle>Query Editor</ContentTitle>
        </ContentHeader>
        <TabsContainer>
          <StyledTabs value={2} onChange={(_e, newValue) => {
            if (newValue === 0) navigate('/dashboard/overview');
            if (newValue === 1) navigate('/dashboard/schema');
          }}>
            <StyledTab label="Overview" />
            <StyledTab label="Schema" disabled />
            <StyledTab label="Query" />
          </StyledTabs>
        </TabsContainer>
        <TabPanel>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Please connect to a database to run queries.
          </div>
        </TabPanel>
      </>
    );
  }

  return (
    <>
      <ContentHeader>
        <ContentTitle>Query Editor</ContentTitle>
      </ContentHeader>

      <TabsContainer>
        <StyledTabs value={2} onChange={(_e, newValue) => {
          if (newValue === 0) navigate('/dashboard/overview');
          if (newValue === 1) navigate('/dashboard/schema');
        }}>
          <StyledTab label="Overview" />
          <StyledTab label="Schema" />
          <StyledTab label="Query" />
        </StyledTabs>
      </TabsContainer>

      <TabPanel>
        <QueryEditor
          key={`query-editor-${connectedDatabase.id}-${schemaVersion}`}
          databaseId={connectedDatabase.id}
          engine={connectedDatabase.engine}
          initialQuery={initialQuery}
        />
      </TabPanel>
    </>
  );
}
