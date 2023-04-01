import React, { useState, Fragment } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AuthGuard } from "./AuthGuard";

const DashboardLayoutRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  // [theme.breakpoints.up("lg")]: {
  //   paddingLeft: 280,
  // },
}));

export function DashboardLayout(props) {
  const { children } = props;
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AuthGuard>
      <Navbar onSidebarOpen={() => setSidebarOpen(true)} />
      <Sidebar onClose={() => setSidebarOpen(false)} open={isSidebarOpen} />
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
