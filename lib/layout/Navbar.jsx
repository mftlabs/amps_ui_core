import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import { AccountPopover } from "./AccountPopover";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { useLocation } from "react-router-dom";
import moment from "moment-timezone";
import { useQuery } from "@tanstack/react-query";
import { queryFn, request } from "../util/util";
import { useUIContext } from "../context/UIContext";

const Clock = ({ timezone }) => {
  const [dt, setDt] = useState(
    new Date().toLocaleString("en-US", { timeZone: timezone })
  );

  useEffect(() => {
    let secTimer = setInterval(() => {
      setDt(new Date().toLocaleTimeString("en-US", { timeZone: timezone }));
    }, 1000);

    return () => clearInterval(secTimer);
  }, []);

  return (
    <>
      <Typography noWrap={true} color="neutral.500">
        <Box
          component="span"
          sx={{
            display: {
              xs: "none",
              lg: "unset",
            },
          }}
        ></Box>
        {dt} {moment().tz(timezone).zoneAbbr()}
      </Typography>
      ;
    </>
  );
};

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

export const Navbar = (props) => {
  const { onSidebarOpen, Content, ...other } = props;
  const { pages, NavbarContent } = useUIContext();
  const settingsRef = useRef(null);
  const [openAccountPopover, setOpenAccountPopover] = useState(false);

  const location = useLocation();

  const [crumbs, setCrumbs] = useState([]);
  useEffect(() => {
    var curr = "";
    var root = "";
    var cr = location.pathname.substring(1).split("/");
    cr = cr.map((piece, idx) => {
      var title = piece;
      curr = [curr, piece].join("/");
      if (idx == 0) {
        if (pages[piece]) {
          title = pages[piece].title;
          root = piece;
        }
      }

      if (idx == 2) {
        title = pages[root].subpages[piece].title;
      }
      return {
        title: title,
        href: curr,
        active: idx === cr.length - 1,
      };
    });

    setCrumbs(cr);
  }, [location.pathname]);

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          left: {
            lg: 280,
          },
          width: {
            lg: "calc(100% - 280px)",
          },
          zIndex: 2,
        }}
        {...other}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2,
          }}
        >
          <IconButton
            onClick={onSidebarOpen}
            sx={{
              display: {
                xs: "inline-flex",
                lg: "none",
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Breadcrumbs sx={{ mx: 3 }} aria-label="breadcrumb">
            {crumbs.map(({ title, href, active }) => {
              return (
                <Link
                  component={RouterLink}
                  underline="hover"
                  key={href}
                  color={active ? "text.primary" : "inherit"}
                  to={href}
                >
                  {title}
                </Link>
              );
            })}
          </Breadcrumbs>

          {/* <Tooltip title="Search">
            <IconButton sx={{ ml: 1 }}>
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip> */}

          <Box sx={{ flexGrow: 1 }} />
          <Clock timezone={server_time_zone} />
          <NavbarContent />
          <Tooltip title="Account">
            <IconButton
              // sx={{ padding: 0 }}
              ref={settingsRef}
              onClick={() => setOpenAccountPopover(true)}
            >
              {/* <Badge badgeContent={4} color="primary" variant="dot"> */}
              <AccountCircleIcon fontSize="large" />

              {/* </Badge> */}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </DashboardNavbarRoot>
      <AccountPopover
        anchorEl={settingsRef.current}
        open={openAccountPopover}
        onClose={() => setOpenAccountPopover(false)}
      />
    </>
  );
};

Navbar.propTypes = {
  onSidebarOpen: PropTypes.func,
};
