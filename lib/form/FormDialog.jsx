import React, { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Form from "./Form";
import Update, { UpdateForm } from "./Update";

export function FormDialog(props) {
  const { open, title, setOpen, style = {}, update } = props;
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      {...(style.width ? { fullWidth: true, maxWidth: style.width } : {})}
      sx={{ p: 3 }}
    >
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, px: 2, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            pt: 1,
            minWidth: 500,
            minHeight: 500,
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {update ? <Update {...props} /> : <Form {...props} />}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
