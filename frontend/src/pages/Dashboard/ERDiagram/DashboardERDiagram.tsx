import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, alpha } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useDashboard } from '../DashboardLayout';
import {
  ContentHeader,
  ContentTitle,
  StyledTabs,
  StyledTab,
  TabPanel,
  TabsContainer,
} from '../Dashboard.styles';
import RelationshipGraph from './RelationshipGraph';

export default function DashboardERDiagram() {
  const navigate = useNavigate();
  const { connectedDatabase } = useDashboard();

  // Redirect if no database connected
  if (!connectedDatabase) {
    return (
      <>
        <ContentHeader>
          <ContentTitle>
            <AccountTreeIcon sx={{ mr: 1 }} />
            ER Diagram
          </ContentTitle>
        </ContentHeader>
        <TabsContainer>
          <StyledTabs 
            value={3} 
            onChange={(_e, newValue) => {
              if (newValue === 0) navigate('/dashboard/overview');
              if (newValue === 1) navigate('/dashboard/schema');
              if (newValue === 2) navigate('/dashboard/query');
            }}
          >
            <StyledTab label="Overview" />
            <StyledTab label="Schema" />
            <StyledTab label="Query" disabled />
            <StyledTab label="ER Diagram" />
          </StyledTabs>
        </TabsContainer>
        <TabPanel>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 250px)',
          }}>
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                borderStyle: 'dashed',
                maxWidth: 400,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <StorageIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                No Database Connected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please connect to a database to view the ER diagram and table relationships.
              </Typography>
            </Paper>
          </Box>
        </TabPanel>
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
            if (newValue === 0) navigate('/dashboard/overview');
            if (newValue === 1) navigate('/dashboard/schema');
            if (newValue === 2) navigate('/dashboard/query');
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
