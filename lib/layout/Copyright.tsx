import { Typography, Link } from "@mui/material";
import React from "react";

export function Copyright(props: any) {
  return (
    <Typography
      variant="caption"
      sx={{ my: 1, mr: 1 }}
      color="text.secondary"
      align="end"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mftlabs.io/">
        MFT Labs
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
