import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { useWindowSize } from "../hooks/useWindowSize";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export const Modal = forwardRef((props, ref) => {
  const [width, height] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [title, setTitle] = useState(null);
  const [actions, setActions] = useState([]);

  const doOpen = () => {
    console.log("OPENING");
    setOpen(true);
  };

  const doClose = () => {
    setOpen(false);
  };

  const doToggle = () => {
    setOpen((_) => !_);
  };

  const configure = ({ title, content, actions = [] }) => {
    setActions(actions);
    setContent(content);
    setTitle(title);
  };

  useImperativeHandle(ref, () => ({
    open: doOpen,
    close: doClose,
    toggle: doToggle,
    configure: configure,
  }));
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="lg"
        fullWidth={true}
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          {title}
        </BootstrapDialogTitle>
        <DialogContent
          sx={{ minWidth: 500, height: 0.7 * height, maxHeight: "80vh" }}
          dividers
        >
          {content}
        </DialogContent>
        {Boolean(actions.length) && (
          <DialogActions>
            {actions.map(({ handler, text, component }) =>
              component ? (
                component
              ) : (
                <Button key={text} autoFocus onClick={handler}>
                  {text}
                </Button>
              )
            )}
            {/* <Button key={close} autoFocus onClick={handleClose}>
            Close
          </Button> */}
          </DialogActions>
        )}
      </BootstrapDialog>
    </div>
  );
});
