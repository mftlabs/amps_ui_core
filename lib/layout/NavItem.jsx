// import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Button, ListItem } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { useLocation } from "react-router-dom";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const NavButton = (props) => {
  const { href, icon, title, onClose, child, ...others } = props;
  const [active, setActive] = useState(false);
  let location = useLocation();
  useEffect(() => {
    if (location) {
      setActive(
        href ? location.pathname.split("/")[1] === href.split("/")[1] : false
      );
    }
  }, [location.pathname]);
  return (
    <ListItem
      disableGutters
      sx={{
        display: "flex",
        mb: 0.5,
        py: 0,
        px: 2,
      }}
      {...others}
    >
      <Button
        component={RouterLink}
        to={href}
        onClick={() => onClose?.()}
        startIcon={icon}
        disableRipple
        sx={{
          backgroundColor: active && "rgba(255,255,255, 0.08)",
          borderRadius: 1,
          color: active ? "secondary.main" : "neutral.300",
          fontWeight: active && "fontWeightBold",
          justifyContent: "flex-start",
          px: child ? 5 : 3,
          textAlign: "left",
          textTransform: "none",
          width: "100%",
          "& .MuiButton-startIcon": {
            color: active ? "secondary.main" : "neutral.400",
          },
          "&:hover": {
            backgroundColor: "rgba(255,255,255, 0.08)",
          },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>{title}</Box>
      </Button>
    </ListItem>
  );
};

export const NavItem = (props) => {
  const { href, icon, title, onClose, children, ...others } = props;
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (children) {
      var val = Object.values(children).find((obj) => {
        return obj.href.split("/")[1] == location.pathname.split("/")[1];
      });
      var active = val !== undefined;
      setActive(active);
    } else {
      setActive(
        href.split("/")[1] ? location.pathname.split("/")[1] === href : false
      );
    }
  }, [location.pathname]);

  // useEffect(() => {
  //   if (children) {
  //     var val = Object.values(children).find((obj) => {
  //       return obj.href == location.pathname.split("/")[0];
  //     });
  //     var active = val !== undefined;
  //     //   if (active) {
  //     //     setOpen(true)
  //     //   }
  //     //   setOpen(active);
  //   }
  // }, []);

  useEffect(() => {
    // console.log(active);
  }, [active]);

  return children ? (
    <>
      <ListItem
        disableGutters
        sx={{
          display: "flex",
          mb: 0.5,
          py: 0,
          px: 2,
        }}
        {...others}
      >
        <Button
          onClick={() => {
            setOpen(!open);
          }}
          startIcon={icon}
          disableRipple
          sx={{
            // backgroundColor: active && "rgba(255,255,255, 0.08)",
            borderRadius: 1,
            color: active ? "secondary.main" : "neutral.300",
            fontWeight: active && "fontWeightBold",
            justifyContent: "flex-start",
            px: 3,
            textAlign: "left",
            textTransform: "none",
            width: "100%",
            "& .MuiButton-startIcon": {
              color: active ? "secondary.main" : "neutral.400",
            },
            "&:hover": {
              backgroundColor: "rgba(255,255,255, 0.08)",
            },
          }}
        >
          <Box sx={{ flexGrow: 1 }}>{title}</Box>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
      </ListItem>
      {open &&
        Object.values(children).map((object) => {
          return (
            <NavButton
              child
              key={object.title}
              icon={object.icon}
              href={object.href}
              title={object.title}
              children={object.children}
              onClose={onClose}
            />
          );
        })}
    </>
  ) : (
    <NavButton {...props} />
  );
};

NavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.string,
};
