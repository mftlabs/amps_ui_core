import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Grid } from "../layout/Grid";
import { Subpage } from "./Subpage";
import { useWindowSize } from "../hooks/useWindowSize";
import { useTokens } from "../hooks/useTokens";
import { useUIContext } from "../context/UIContext";

export function Generic() {
  const { pages } = useUIContext();
  const [width, height] = useWindowSize();
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
    var tokens = location.pathname.substring(1).split("/");

    var config = pages[tokens[0]];

    if (main !== undefined) {
      if (pages[main]) {
        // setConfig(config);
        // setGrid();
      } else {
        navigate("/message_events");
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
          width: lgUp ? width - 280 : width,
          // display: "flex",
          // py: 2,
        }}
      >
        <Routes>
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
