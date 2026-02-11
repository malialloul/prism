import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Skeleton } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import BuildIcon from "@mui/icons-material/Build";
import {
  ApisPageWrapper,
  ApisHeader,
  ApisTitle,
  ApisTabs,
  ApisTab,
  NoDatabaseMessage,
} from "./ApisPage.styles";
import { useWorkspace } from "../DashboardPage/DashboardLayout";
import { createContext, useContext, useState } from "react";
import { ROUTES } from "../../constants";

// Context for sharing APIs state with child routes
interface ApisContextType {
  openApiRefreshKey: number;
  triggerOpenApiRefresh: () => void;
}

const ApisContext = createContext<ApisContextType | null>(null);

export const useApisContext = () => {
  const context = useContext(ApisContext);
  if (!context) {
    throw new Error("useApisContext must be used within ApisLayout");
  }
  return context;
};

export default function ApisLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const [openApiRefreshKey, setOpenApiRefreshKey] = useState(0);

  const connectedDatabase = workspace?.connectedDatabase;
  const isSwitchingDatabase = workspace?.isSwitchingDatabase;

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes(ROUTES.APIS.AUTO)) return 1;
    if (location.pathname.includes(ROUTES.APIS.OPENAPI)) return 2;
    return 0; // build
  };

  const activeTab = getActiveTab();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate(ROUTES.APIS.BUILD);
    else if (newValue === 1) navigate(ROUTES.APIS.AUTO);
    else if (newValue === 2) navigate(ROUTES.APIS.OPENAPI);
  };

  const triggerOpenApiRefresh = () => {
    setOpenApiRefreshKey((prev) => prev + 1);
  };

  // Show loading skeleton while context is loading or switching databases
  if (!workspace || isSwitchingDatabase) {
    return (
      <ApisPageWrapper>
        <ApisHeader>
          <ApisTitle>API Explorer</ApisTitle>
          <ApisTabs value={activeTab}>
            <ApisTab
              icon={<BuildIcon sx={{ fontSize: "1rem", mr: 0.5 }} />}
              iconPosition="start"
              label="Build Query"
              disabled
            />
            <ApisTab label="Auto-generated APIs" disabled />
            <ApisTab label="Open API" disabled />
          </ApisTabs>
        </ApisHeader>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* API content skeleton */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
        </Box>
      </ApisPageWrapper>
    );
  }

  if (!connectedDatabase) {
    return (
      <ApisPageWrapper>
        <NoDatabaseMessage>
          <StorageIcon sx={{ fontSize: "4rem", opacity: 0.3 }} />
          <Box sx={{ fontSize: "1.25rem", fontWeight: 500 }}>
            No Database Connected
          </Box>
          <Box sx={{ fontSize: "0.875rem", maxWidth: "400px" }}>
            Connect to a database to view and test the auto-generated REST APIs
            for your tables.
          </Box>
        </NoDatabaseMessage>
      </ApisPageWrapper>
    );
  }

  return (
    <ApisContext.Provider value={{ openApiRefreshKey, triggerOpenApiRefresh }}>
      <ApisPageWrapper>
        <ApisHeader>
          <ApisTitle>API Explorer</ApisTitle>
          <ApisTabs value={activeTab} onChange={handleTabChange}>
            <ApisTab
              icon={<BuildIcon sx={{ fontSize: "1rem", mr: 0.5 }} />}
              iconPosition="start"
              label="Build Query"
            />
            <ApisTab label="Auto-generated APIs" />
            <ApisTab label="Open API" />
          </ApisTabs>
        </ApisHeader>
        <Outlet />
      </ApisPageWrapper>
    </ApisContext.Provider>
  );
}
