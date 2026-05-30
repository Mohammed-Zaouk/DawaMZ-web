import { Refine } from "@refinedev/core";
import {
  RefineThemes,
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
  useNotificationProvider,
} from "@refinedev/antd";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { ConfigProvider, App, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../services/supabase";
import "@refinedev/antd/dist/reset.css";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function AdminPanel() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setAllowed(session?.user?.email === ADMIN_EMAIL);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (allowed === null)
    return <div style={{ minHeight: "100vh", background: "#0f172a" }} />;

  if (!allowed) return <Navigate to="/xk72sat2" replace />;

  return (
    <ConfigProvider theme={RefineThemes.Blue}>
      <App>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          notificationProvider={useNotificationProvider}
          resources={[
            {
              name: "regions",
              list: "/zp9qpanel/regions",
              create: "/zp9qpanel/regions/create",
              edit: "/zp9qpanel/regions/edit/:id",
              meta: { label: "Regions & Cities", canDelete: true },
            },
            {
              name: "pharmacies",
              list: "/zp9qpanel/pharmacies",
              create: "/zp9qpanel/pharmacies/create",
              edit: "/zp9qpanel/pharmacies/edit/:id",
              meta: { label: "Pharmacies", canDelete: true },
            },
            {
              name: "cities",
              list: "/zp9qpanel/regions",
              create: "/zp9qpanel/cities/create",
              edit: "/zp9qpanel/cities/edit/:id",
              meta: { label: "Cities", canDelete: true, hide: true },
            },
          ]}
          options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
        >
          <ThemedLayoutV2
            Sider={() => (
              <ThemedSiderV2
                Title={({ collapsed }) => (
                  <ThemedTitleV2
                    collapsed={collapsed}
                    text={collapsed ? "" : "DawaMZ Admin"}
                  />
                )}
                render={({ items, collapsed }) => (
                  <>
                    {items}
                    <div
                      style={{
                        marginTop: "auto",
                        borderTop: "1px solid #1e293b",
                        padding: collapsed ? "12px 0" : "8px 12px",
                        display: "flex",
                        justifyContent: collapsed ? "center" : "flex-start",
                      }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={() => supabaseClient.auth.signOut()}
                        style={{
                          width: collapsed ? "auto" : "100%",
                          justifyContent: "flex-start",
                        }}
                      >
                        {!collapsed && "Logout"}
                      </Button>
                    </div>
                  </>
                )}
              />
            )}
          >
            <Outlet />
          </ThemedLayoutV2>
        </Refine>
      </App>
    </ConfigProvider>
  );
}
