import { Box } from "@mui/material";
import { useWorkspace } from "../../../layout";
import { usePermissions, AccessRestricted, } from "../../../components";
import {
  ContentHeader,
  ContentTitle,
} from "./Query.styles";
import { QueryEditor } from "./QueryEditor";
import { QuerySkeleton } from "../../../components/Skeletons";

export default function Query() {
  const workspace = useWorkspace()!;
  const { canRunQuery } = usePermissions();

  const { connectedDatabase, schemaVersion, initialQuery, isLoading } = workspace;

  // Show skeleton while loading
  if (isLoading) {
    return <QuerySkeleton />;
  }

  // TypeScript safety - WorkspaceLayout handles redirect if no connected database
  if (!connectedDatabase) return null;

  return (
    <>
      <ContentHeader>
        <ContentTitle>Query Editor</ContentTitle>
      </ContentHeader>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {canRunQuery ? (
          <QueryEditor
            key={`query-editor-${connectedDatabase.id}-${schemaVersion}`}
            databaseId={connectedDatabase.id}
            engine={connectedDatabase.engine}
            initialQuery={initialQuery}
          />
        ) : (
          <AccessRestricted
            message="Query Access Restricted"
            description="You don't have permission to run queries. Please contact the account owner to request access."
            permission="runQuery"
          />
        )}
      </Box>
    </>
  );
}
