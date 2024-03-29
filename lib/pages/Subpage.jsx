import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Update } from "../form/Update";
import InfoIcon from "@mui/icons-material/Info";
import { useTokens } from "../hooks/useTokens";
import { Grid } from "../layout/Grid";
import { useUIContext } from "amps_ui_core";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  position: "relative",
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  position: "relative",
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  //   padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  position: "relative",
  boxSizing: "border-box",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    position: "relative",
    boxSizing: "border-box",
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  height: "100%",
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",

  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const SubNavItem = ({ title, href, icon, route, open }) => {
  const [active, setActive] = useState(false);
  const [to, setTo] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const tokens = route.substring(1).split("/");

    setActive(tokens[2] == href);

    var root = [""].concat(tokens.slice(0, 2));
    if (href) {
      root = root.concat([href]);
    }
    setTo(root.join("/"));
  }, [route]);
  return (
    <ListItem key={title} disablePadding>
      <ListItemButton
        sx={{
          minHeight: 48,
          justifyContent: open ? "initial" : "center",
          px: 2.5,
          // backgroundColor: active && "rgba(255,255,255, 0.08)",
          color: active ? "primary.main" : "neutral.700",

          textAlign: "left",
          textTransform: "none",
          width: "100%",

          "&:hover": {
            backgroundColor: "rgba(255,255,255, 0.08)",
          },
        }}
        onClick={() => navigate(to)}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 3 : "auto",
            justifyContent: "center",
            color: active ? "primary.main" : "neutral.700",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={title}
          sx={{ opacity: open ? 1 : 0 }}
          primaryTypographyProps={{
            sx: { fontWeight: active && 700 },
          }}
        ></ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

export function Subpage({ config }) {
  const theme = useTheme();
  const { checkPerm } = useUIContext();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const [subpages, setSubpages] = useState([]);
  const { main, id, field } = useTokens();
  const navigate = useNavigate();
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (subpages.length && field) {
      if (!subpages.find((sp) => sp.href == field)) {
        navigate(`/${main}/${id}`);
      }
    }
  }, [subpages, field]);

  useEffect(() => {
    if (main) {
      if (config.subpages) {
        var sps = Object.values(config.subpages).reduce((acc, sp) => {
          if (checkPerm({ main, field: sp.href, perm: sp.perm }, "read")) {
            acc.push(sp);
            return acc;
          } else {
            return acc;
          }
        }, []);
        console.log(sps);
        setSubpages(sps);
      } else {
        setSubpages([]);
      }
    }
  }, [main]);

  return (
    subpages && (
      <Box sx={{ display: "flex", height: "100%" }}>
        <CssBaseline />
        {/* <AppBar position="fixed" open={open}> */}
        {/* <Toolbar>

        <Typography variant="h6" noWrap component="div">
          Mini variant drawer
        </Typography>
      </Toolbar> */}
        {/* </AppBar> */}
        <Drawer variant="permanent" open={open}>
          <List>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,

                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  ...(open && { display: "none" }),
                }}
                onClick={handleDrawerOpen}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <MenuIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,

                  justifyContent: "end",
                  px: 2.5,
                  ...(!open && { display: "none" }),
                }}
                onClick={handleDrawerClose}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "end",
                  }}
                >
                  <ChevronLeftIcon />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />

          <List>
            <SubNavItem
              title={config.subroot?.title ?? "Details"}
              icon={config.subroot?.icon ?? <InfoIcon />}
              route={location.pathname}
              open={open}
            />
          </List>
          {subpages.length > 0 && (
            <>
              <Divider />

              <List>
                {subpages.map((conf, index) => (
                  <SubNavItem {...conf} route={location.pathname} open={open} />
                ))}
              </List>

              <Divider />
            </>
          )}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 0, overflow: "auto" }}>
          {config && (
            <Routes>
              <Route
                path="/"
                key="/"
                element={
                  config.subroot ? (
                    <config.subroot.view location={location} />
                  ) : (
                    <Update key={`${main}_${id}`} location={location} />
                  )
                }
              />

              {config.subpages &&
                subpages.map((sp) => {
                  return (
                    <>
                      <Route
                        path={sp.path ? sp.path : sp.href}
                        key={sp.href}
                        element={
                          sp.field ? (
                            <Update key={sp.href} location={location} />
                          ) : sp.view ? (
                            <sp.view />
                          ) : (
                            <Grid
                              key={sp.href}
                              isSubpage={true}
                              config={sp}
                              route={sp.route}
                            ></Grid>
                          )
                        }
                      />
                      {!sp.field && !sp.view && (
                        <Route
                          key={sp.href + "/:fieldid/*"}
                          path={sp.href + "/:fieldid/*"}
                          element={
                            <Update
                              key={sp.href + "/:fieldid/*"}
                              field={sp.href}
                              location={location}
                            />
                          }
                        ></Route>
                      )}
                    </>
                  );
                })}

              {/* <Route path="/:id/:field/:fieldid" element={"SubDetails"} /> */}
            </Routes>
          )}
        </Box>
      </Box>
    )
  );
}
