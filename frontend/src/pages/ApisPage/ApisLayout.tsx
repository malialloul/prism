import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BuildIcon from "@mui/icons-material/Build";
import {
  ApisPageWrapper,
  ApisHeader,
  ApisTitle,
  ApisTabs,
  ApisTab,
} from "./ApisPage.styles";
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
  const [openApiRefreshKey, setOpenApiRefreshKey] = useState(0);

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
