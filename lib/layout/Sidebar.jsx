import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Divider, Drawer, Typography, useMediaQuery } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
// import { ChartBar as ChartBarIcon } from "../icons/chart-bar";
// import { Cog as CogIcon } from "../icons/cog";
// import { Lock as LockIcon } from "../icons/lock";
// import { Selector as SelectorIcon } from "../icons/selector";
// import { ShoppingBag as ShoppingBagIcon } from "../icons/shopping-bag";
// import { User as UserIcon } from "../icons/user";
// import { UserAdd as UserAddIcon } from "../icons/user-add";
// import { Users as UsersIcon } from "../icons/users";
// import { XCircle as XCircleIcon } from "../icons/x-circle";
import { NavItem } from "./NavItem";
import { Link } from "react-router-dom";

import { useUIContext } from "../contexts/UIContext";

export const Sidebar = (props) => {
  const { useAuthContext } = useUIContext();
  const { user } = useAuthContext();
  const { open, onClose } = props;
  // const router = useRouter();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), {
    defaultMatches: true,
    noSsr: false,
  });

  useEffect(
    () => {
      if (open) {
        onClose?.();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const content = (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              flex: 1,
              width: "100%",
              height: 96,
              maxHeight: { xs: 64, md: 96 },
            }}
          >
            <Box
              component="div"
              sx={{
                flex: 1,
                width: "100%",
                height: 96,

                backgroundImage: 'url("/images/logo")',
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
          </Link>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {Object.keys(user.menu).length ? (
            Object.entries(user.menu).map(([title, object]) => {
              return (
                <NavItem
                  key={object.children ? title : object.title}
                  icon={object.icon}
                  href={object.href}
                  title={object.children ? title : object.title}
                  children={object.children}
                  onClose={onClose}
                />
              );
            })
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "start",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  my: 0.75,
                  // alignItems: "center",
                }}
              >
                <ErrorIcon sx={{ mx: "1rem", color: "red" }} />
                <Typography variant="body1" color="red">
                  Insufficient Permissions
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="red"
                sx={{ mx: "1rem", my: 0.75 }}
              >
                Ask an administrator to grant you access.
              </Typography>
            </Box>
          )}
        </Box>
        <Divider sx={{ borderColor: "#2D3748" }} />
        <Box
          sx={{
            px: 2,
            py: 3,
          }}
        ></Box>
      </Box>
    </Fragment>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        onClose={onClose}
        open={open}
        sx={{ width: 280 }}
        PaperProps={{
          sx: {
            backgroundColor: "neutral.900",
            color: "#FFFFFF",
            width: 280,
          },
        }}
        variant="temporary"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: "neutral.900",
          color: "#FFFFFF",
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

Sidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
