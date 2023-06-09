import React from "react";

import { Generic } from "./pages/Generic";

import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

import { Copyright } from "./layout/Copyright";
import { BrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./layout/DashboardLayout";
import { FileProvider, FileConsumer } from "./contexts/file-context";

export const Main = ({ Auth }) => {
  return (
    <BrowserRouter>
      <Box
        sx={{
          height: "100%",
          width: "100%",
          p: 0,
          m: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flex: 1,
            // alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route
              path="/*"
              element={
                <FileProvider>
                  <FileConsumer>
                    {() => (
                      <DashboardLayout>
                        <Generic></Generic>
                      </DashboardLayout>
                    )}
                  </FileConsumer>
                </FileProvider>
              }
            />
          </Routes>
        </Box>

        <Copyright />
      </Box>
    </BrowserRouter>
  );
};
