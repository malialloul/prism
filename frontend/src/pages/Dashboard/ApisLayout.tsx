import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import BuildIcon from "@mui/icons-material/Build";
import {
  ApisPageWrapper,
  ApisHeader,
  ApisTitle,
  ApisTabs,
  ApisTab,
  NoDatabaseMessage,
} from "./ApisPage/ApisPage.styles";
import { useDashboard } from "./DashboardLayout";
import { createContext, useContext, useState } from "react";

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
  const { connectedDatabase } = useDashboard();
  const [openApiRefreshKey, setOpenApiRefreshKey] = useState(0);

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes("/apis/auto")) return 1;
    if (location.pathname.includes("/apis/openapi")) return 2;
    return 0; // build
  };

  const activeTab = getActiveTab();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate("/dashboard/apis/build");
    else if (newValue === 1) navigate("/dashboard/apis/auto");
    else if (newValue === 2) navigate("/dashboard/apis/openapi");
  };

  const triggerOpenApiRefresh = () => {
    setOpenApiRefreshKey((prev) => prev + 1);
  };

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
