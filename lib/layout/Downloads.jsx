import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import {
  Badge,
  Box,
  IconButton,
  Popover,
  popoverClasses,
  Popper,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { Add, Close, Download, StopCircle, Upload } from "@mui/icons-material";
import MaterialReactTable from "material-react-table";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { useFormik } from "formik";
import { useFileContext } from "../contexts/file-context";
import { Progress } from "amps_ui_core";
import { useConfirm } from "material-ui-confirm";
import { styled } from "@mui/material/styles";
import { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export function Downloads() {
  const [open, setOpen] = React.useState(false);
  const [height, setHeight] = React.useState(500);
  const [width, setWidth] = React.useState(800);
  const buttonRef = React.useRef();
  const confirm = useConfirm();
  const {
    downloads,
    dPending,
    cancelDownload,
    downloadAdded,
    dChecked,
    resetChecked,
  } = useFileContext();
  React.useEffect(() => {
    if (open) {
      resetChecked();
    }
  }, [open]);

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), {
    defaultMatches: true,
    noSsr: false,
  });

  React.useEffect(() => {
    if (lgUp) {
      setWidth(900);

      return;
    }
  }, [lgUp]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {buttonRef.current && (
        <Popover
          id={"download-popover"}
          open={downloadAdded}
          anchorEl={buttonRef.current}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          PaperProps={{
            sx: {
              backgroundColor: "neutral.500",
              color: "neutral.200",
              maxWidth: 220,
              border: "1px solid #dadde9",
            },
          }}
        >
          <Typography sx={{ p: 2 }} color="inherit">
            Download Added
          </Typography>
        </Popover>
      )}

      <Tooltip title="Downloads">
        <IconButton ref={buttonRef} onClick={handleClickOpen}>
          <Badge badgeContent={dChecked} color="primary">
            <Download fontSize="medium" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        maxWidth="xl"
      >
        <Resizable
          height={height}
          width={width}
          onResize={(event, data) => {
            setHeight(height + event.movementY);
            setWidth(width + event.movementX);
          }}
        >
          <>
            <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
              Downloads
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
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ height: height, width: width }}>
              {/* <Box sx={{ height: height, width: width }}> */}
              <MaterialReactTable
                initialState={{ density: "compact" }}
                columns={[
                  {
                    header: "File Name",
                    accessorKey: "fname",
                    flex: 1,
                    type: "text",
                  },
                  {
                    header: "Topic",
                    accessorKey: "topic",
                    flex: 1,
                    type: "text",
                  },
                  {
                    header: "Progress",
                    accessorKey: "progress",
                    flex: 2,
                    Cell: ({ cell }) => {
                      if (cell.getValue() > 1) {
                        return (
                          <Progress
                            size={cell.getValue()}
                            key="indeterminate"
                          />
                        );
                      } else {
                        var progress = cell.getValue() * 100;
                        return <Progress key="determinate" value={progress} />;
                      }
                    },
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                  },
                ]}
                data={downloads}
                // data={isSubpage ? data ?? [] : data?.rows ?? []} //data is undefined on first render

                muiTableContainerProps={{
                  // ref: tableContainerRef, //get access to the table container element
                  sx: { height: "calc(100% - 7rem)" }, //give the table a max height
                }}
                muiTablePaperProps={{
                  // ref: tableContainerRef, //get access to the table container element
                  sx: { height: "100%" }, //give the table a max height
                }}
                enableColumnResizing
                enableRowActions={true}
                renderRowActions={({ row }) => {
                  return (
                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                      <IconButton
                        disabled={row.original.status != "Downloading"}
                        onClick={async () => {
                          confirm({
                            msg: "Are you sure you want to abort this download?",
                          }).then(() => {
                            cancelDownload(row.original.id);
                          });

                          // var title = "Delete Record";
                          // var msg = "Are you sure you want to delete?";
                        }}
                      >
                        <StopCircle fontSize="small" />
                      </IconButton>
                      <IconButton
                        disabled={row.original.downloadUrl == undefined}
                        onClick={async () => {
                          const link = document.createElement("a");
                          link.href = row.original.downloadUrl;
                          link.setAttribute("download", row.original.fname);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          // var title = "Delete Record";
                          // var msg = "Are you sure you want to delete?";
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                }}
                // renderTopToolbarCustomActions={() => <UploadForm />}
                // state={}
              />
              {/* </Box> */}
            </DialogContent>
          </>
        </Resizable>
      </Dialog>
    </div>
  );
}
