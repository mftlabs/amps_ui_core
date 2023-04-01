import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Typography,
  useMediaQuery,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
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

import { useUIContext } from "../context/UIContext";

export const Sidebar = (props) => {
  const { menu } = useUIContext();
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
                maxHeight: { xs: 64, md: 96 },
                backgroundImage: 'url("/images/logo")',
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
          </Link>
        </Box>

        <Divider
          sx={{
            borderColor: "#2D3748",
            my: 3,
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          {Object.entries(menu).map(([title, object]) => {
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
          })}
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
        open
        sx={{ width: 280 }}
        PaperProps={{
          sx: {
            backgroundColor: "neutral.900",
            color: "#FFFFFF",
            width: 280,
          },
        }}
        variant="persistent"
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
