import React, { useEffect, useState, useMemo, useLayoutEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Tooltip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
// import { CustomerListResults } from "../components/customer/customer-list-results";
// import { CustomerListToolbar } from "../components/customer/customer-list-toolbar";
import DashboardLayout from "../layout/dashboard-layout";
// import { customers } from "../__mocks__/customers";
import Toolbar from "../layout/toolbar";
import { pages } from "../util/pages";
import MaterialReactTable from "material-react-table";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import Loader from "../util/components/Loader";
import { request } from "../util/util";
import { useConfirm } from "material-ui-confirm";
import Grid from "../layout/grid";
import Subpage from "./Subpage";
import useWindowSize from "../hooks/useWindowSize";

export function Generic({ useSchemas, useGridActions }) {
  console.log(useGridActions);
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
  const { schemas } = useSchemas();

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
              <Grid
                key={p.href}
                route={p.href}
                config={p}
                schemas={schemas}
                useGridActions={useGridActions}
                gh={useGridActions}
              ></Grid>
            );

            var subview = p.Subview ? (
              <p.Subview config={p} />
            ) : (
              <Subpage
                config={p}
                schemas={schemas}
                useGridActions={useGridActions}
              />
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
