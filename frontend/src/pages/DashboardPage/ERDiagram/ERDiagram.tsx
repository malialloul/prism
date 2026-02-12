import { Box } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useWorkspace } from '../../../layout';
import { useFullSchema } from '../../../api/entities/schema';
import ERDiagramSkeleton from '../../../components/Skeletons/ERDiagramSkeleton';
import {
    ContentHeader,
    ContentTitle,
} from './ERDiagram.styles';
import RelationshipGraph from './RelationshipGraph';

export default function ERDiagram() {
    const workspace = useWorkspace()!;
    const { connectedDatabase } = workspace;

    const { data, isLoading, error, refetch } = useFullSchema(connectedDatabase?.id);

    // TypeScript safety - WorkspaceLayout handles redirect if no connected database
    if (!connectedDatabase) return null;

    return (
        <>
            <ContentHeader>
                <ContentTitle>
                    <AccountTreeIcon sx={{ mr: 1 }} />
                    ER Diagram - {connectedDatabase.name}
                </ContentTitle>
            </ContentHeader>
            <Box sx={{
                flex: 1,
                height: 'calc(100vh - 180px)',
                overflow: 'hidden',
            }}>
                {isLoading ? (
                    <ERDiagramSkeleton />
                ) : (
                    <RelationshipGraph
                        tables={data?.tables || []}
                        error={error?.message || null}
                        onRefresh={refetch}
                    />
                )}
            </Box>
        </>
    );
}
