import React, { useState, Fragment } from "react";
import { DashboardNavbar } from "./Navbar";
import { DashboardSidebar } from "./Sidebar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
const DashboardLayoutRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  // [theme.breakpoints.up("lg")]: {
  //   paddingLeft: 280,
  // },
}));

export function DashboardLayout({
  children,
  AuthGuard,
  menu,
  NavbarContent,
  AccountPopover,
  pages,
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AuthGuard>
      <DashboardNavbar
        Content={NavbarContent}
        pages={pages}
        AccountPopover={AccountPopover}
        onSidebarOpen={() => setSidebarOpen(true)}
      />
      <DashboardSidebar
        onClose={() => setSidebarOpen(false)}
        menu={menu}
        open={isSidebarOpen}
      />
      <DashboardLayoutRoot>
        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </DashboardLayoutRoot>
    </AuthGuard>
  );
}
