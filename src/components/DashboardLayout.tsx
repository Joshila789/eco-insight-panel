import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen">
    <AppSidebar />
    <main className="flex-1 p-8 overflow-auto">{children}</main>
  </div>
);

export default DashboardLayout;
