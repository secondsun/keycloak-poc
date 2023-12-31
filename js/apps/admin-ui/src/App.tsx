import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { Page } from "@patternfly/react-core";
import type Keycloak from "keycloak-js";
import { PropsWithChildren, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import { Help } from "ui-shared";

import { Header } from "./PageHeader";
import { PageNav } from "./PageNav";
import { AlertProvider } from "./components/alert/Alerts";
import { PageBreadCrumbs } from "./components/bread-crumb/PageBreadCrumbs";
import { ErrorRenderer } from "./components/error/ErrorRenderer";
import { KeycloakSpinner } from "./components/keycloak-spinner/KeycloakSpinner";
import { RealmsProvider } from "./context/RealmsContext";
import { RecentRealmsProvider } from "./context/RecentRealms";
import { AccessContextProvider } from "./context/access/Access";
import { AdminClientContext } from "./context/auth/AdminClient";
import { RealmContextProvider } from "./context/realm-context/RealmContext";
import { ServerInfoProvider } from "./context/server-info/ServerInfoProvider";
import { WhoAmIContextProvider } from "./context/whoami/WhoAmI";
import { SubGroups } from "./groups/SubGroupsContext";
import { AuthWall } from "./root/AuthWall";

export const mainPageContentId = "kc-main-content-page-container";

export type AdminClientProps = {
  keycloak: Keycloak;
  adminClient: KeycloakAdminClient;
};

const AppContexts = ({
  children,
  keycloak,
  adminClient,
}: PropsWithChildren<AdminClientProps>) => (
  <AdminClientContext.Provider value={{ keycloak, adminClient }}>
    <WhoAmIContextProvider>
      <RealmsProvider>
        <RealmContextProvider>
          <RecentRealmsProvider>
            <AccessContextProvider>
              <Help>
                <AlertProvider>
                  <SubGroups>{children}</SubGroups>
                </AlertProvider>
              </Help>
            </AccessContextProvider>
          </RecentRealmsProvider>
        </RealmContextProvider>
      </RealmsProvider>
    </WhoAmIContextProvider>
  </AdminClientContext.Provider>
);

export const App = ({ keycloak, adminClient }: AdminClientProps) => {
  return (
    <AppContexts keycloak={keycloak} adminClient={adminClient}>
      <Page
        header={<Header />}
        isManagedSidebar
        sidebar={<PageNav />}
        breadcrumb={<PageBreadCrumbs />}
        mainContainerId={mainPageContentId}
      >
        <ErrorBoundary
          FallbackComponent={ErrorRenderer}
          onReset={() =>
            (window.location.href =
              window.location.origin + window.location.pathname)
          }
        >
          <ServerInfoProvider>
            <Suspense fallback={<KeycloakSpinner />}>
              <AuthWall>
                <Outlet />
              </AuthWall>
            </Suspense>
          </ServerInfoProvider>
        </ErrorBoundary>
      </Page>
    </AppContexts>
  );
};
