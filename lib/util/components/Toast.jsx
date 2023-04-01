import React from "react";
import { Snackbar, Alert } from "@mui/material";
export const Toast = ({ severity, open, setOpen, msg }) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}

      // action={action}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {msg}
      </Alert>
    </Snackbar>
  );
};
