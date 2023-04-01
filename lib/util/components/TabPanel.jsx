import { Box } from "@mui/material";
import React from "react";
import Typography from "@mui/material/Typography";

export function TabPanel(props) {
  const { children, value, tab, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== tab}
      id={`simple-tabpanel-${tab}`}
      aria-labelledby={`simple-tab-${tab}`}
      {...other}
    >
      {value === tab && <Box>{children}</Box>}
    </div>
  );
}
