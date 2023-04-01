import { Typography, Link } from "@mui/material";
import React from "react";

export function Copyright(props: any) {
  return (
    <Typography
      variant="body1"
      sx={{ height: "1rem" }}
      color="text.secondary"
      align="center"
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
