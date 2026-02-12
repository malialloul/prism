import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    DashboardPageWrapper,
    DashboardHeader,
    DashboardTitle,
    DashboardTabs,
    DashboardTab,
} from "./DashboardLayout.styles";
import { ROUTES } from "../../constants";
import { useWorkspace } from "../WorkspaceLayout";

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const workspace = useWorkspace();

    const connectedDatabase = workspace?.connectedDatabase;
    const isSwitchingDatabase = workspace?.isSwitchingDatabase ?? false;

    // Determine active tab from URL
    const getActiveTab = () => {
        if (location.pathname.includes("/schema")) return 1;
        if (location.pathname.includes("/query")) return 2;
        if (location.pathname.includes("/er-diagram")) return 3;
        return 0; // overview
    };

    const activeTab = getActiveTab();

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        if (newValue === 0) navigate(ROUTES.DASHBOARD.OVERVIEW);
        else if (newValue === 1) navigate(ROUTES.DASHBOARD.SCHEMA);
        else if (newValue === 2) navigate(ROUTES.DASHBOARD.QUERY);
        else if (newValue === 3) navigate(ROUTES.DASHBOARD.ER_DIAGRAM);
    };

    // Tabs that require a connected database
    const isProtectedTabDisabled = !connectedDatabase || isSwitchingDatabase;

    return (
        <DashboardPageWrapper>
            <DashboardHeader>
                <DashboardTitle>Dashboard</DashboardTitle>
                <DashboardTabs value={activeTab} onChange={handleTabChange} data-tour="dashboard-tabs">
                    <DashboardTab label="Overview" />
                    <DashboardTab label="Schema" disabled={isProtectedTabDisabled} data-tour="schema-tab" />
                    <DashboardTab label="Query" disabled={isProtectedTabDisabled} data-tour="query-tab" />
                    <DashboardTab label="ER Diagram" disabled={isProtectedTabDisabled} data-tour="er-diagram-tab" />
                </DashboardTabs>
            </DashboardHeader>
            <Outlet />
        </DashboardPageWrapper>
    );
}
