import React, { useEffect, useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Grid } from "../layout/Grid";
import { Subpage } from "./Subpage";
import { useWindowSize } from "../hooks/useWindowSize";
import { useTokens } from "../hooks/useTokens";
import { useUIContext } from "../contexts/UIContext";

export function Generic() {
  const { pages, defRoute, useAuthContext } = useUIContext();
  const [width, height] = useWindowSize();
  const { checkMenu, user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [grid, setGrid] = useState(null);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), {
    defaultMatches: true,
    noSsr: false,
  });
  const { main } = useTokens();

  useEffect(() => {
    setGrid(null);
    setConfig(null);

    if (main !== undefined && main != "") {
      console.log(main);
      var resp = checkMenu(main);
      console.log(resp);
      if (resp.success) {
        // setConfig(config);
        // setGrid();
      } else {
        navigate(resp.href || "/");
      }
    }
  }, [location.pathname, main]);
  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: height - 136,
          width: width,
          // display: "flex",
          // py: 2,
        }}
      >
        <Routes>
          <Route
            key={"/"}
            path={"/"}
            element={
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">
                  Welcome {user.user.firstname} {user.user.lastname} (
                  {user.user.username})
                </Typography>
              </Box>
            }
          ></Route>
          {Object.values(pages).map((p) => {
            var view = p.View ? (
              <p.View key={p.href} route={p.href} config={p} />
            ) : (
              <Grid key={p.href} route={p.href} config={p}></Grid>
            );

            var subview = p.Subview ? (
              <p.Subview config={p} />
            ) : (
              <Subpage config={p} />
            );
            return p.View ? (
              <Route
                key={p.href}
                path={`${p.path ? p.path : p.href}`}
                element={view}
              />
            ) : (
              <>
                <Route key={p.href} path={p.href} element={view} />
                <Route
                  key={p.href + "/:id/*"}
                  path={p.href + "/:id/*"}
                  element={subview}
                ></Route>
              </>
            );
          })}
        </Routes>
        {/* <Container sx={{ flex: 1 }} maxWidth={true} maxHeight={true}> */}

        {/* </Container> */}
      </Box>
    </>
  );
}
