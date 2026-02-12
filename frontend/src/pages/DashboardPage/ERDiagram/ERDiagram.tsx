import { useNavigate } from 'react-router-dom';
import { Box, Skeleton, alpha } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useWorkspace } from '../WorkspaceLayout';
import { ROUTES } from '../../../constants';
import {
    ContentHeader,
    ContentTitle,
    StyledTabs,
    StyledTab,
    TabsContainer,
} from './ERDiagram.styles';
import RelationshipGraph from './RelationshipGraph';

export default function ERDiagram() {
    const navigate = useNavigate();
    const workspace = useWorkspace();

    const connectedDatabase = workspace?.connectedDatabase;
    const isSwitchingDatabase = workspace?.isSwitchingDatabase;

    // Show loading skeleton while context is loading or switching databases
    if (!workspace || isSwitchingDatabase || !connectedDatabase) {
        return (
            <>
                <ContentHeader>
                    <ContentTitle>
                        <AccountTreeIcon sx={{ mr: 1 }} />
                        ER Diagram
                    </ContentTitle>
                </ContentHeader>
                <TabsContainer>
                    <StyledTabs value={3}>
                        <StyledTab label="Overview" disabled />
                        <StyledTab label="Schema" disabled />
                        <StyledTab label="Query" disabled />
                        <StyledTab label="ER Diagram" />
                    </StyledTabs>
                </TabsContainer>
                <Box sx={{
                    flex: 1,
                    height: 'calc(100vh - 180px)',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Toolbar Skeleton */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            px: 2,
                            py: 1,
                            bgcolor: 'background.paper',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Skeleton variant="rounded" width={100} height={32} />
                            <Skeleton variant="rounded" width={40} height={32} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="circular" width={32} height={32} />
                        </Box>
                    </Box>

                    {/* Graph Area Skeleton */}
                    <Box sx={{
                        flex: 1,
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: 3,
                            maxWidth: '100%',
                        }}>
                            {[1, 2, 3, 4].map((i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box sx={{
                                        px: 2,
                                        py: 1.5,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}>
                                        <Skeleton variant="text" width="60%" height={20} />
                                    </Box>
                                    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {[1, 2, 3].map((j) => (
                                            <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Skeleton variant="circular" width={16} height={16} />
                                                <Skeleton variant="text" width="40%" height={16} />
                                                <Skeleton variant="text" width="30%" height={16} sx={{ ml: 'auto' }} />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </>
        );
    }

    return (
        <>
            <ContentHeader>
                <ContentTitle>
                    <AccountTreeIcon sx={{ mr: 1 }} />
                    ER Diagram - {connectedDatabase.name}
                </ContentTitle>
            </ContentHeader>
            <TabsContainer>
                <StyledTabs
                    value={3}
                    onChange={(_e, newValue) => {
                        if (newValue === 0) navigate(ROUTES.DASHBOARD.OVERVIEW);
                        if (newValue === 1) navigate(ROUTES.DASHBOARD.SCHEMA);
                        if (newValue === 2) navigate(ROUTES.DASHBOARD.QUERY);
                    }}
                >
                    <StyledTab label="Overview" />
                    <StyledTab label="Schema" />
                    <StyledTab label="Query" />
                    <StyledTab label="ER Diagram" />
                </StyledTabs>
            </TabsContainer>
            <Box sx={{
                flex: 1,
                height: 'calc(100vh - 180px)',
                overflow: 'hidden',
            }}>
                <RelationshipGraph databaseId={connectedDatabase.id} />
            </Box>
        </>
    );
}
