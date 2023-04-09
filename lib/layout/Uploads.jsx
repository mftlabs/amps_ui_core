import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import { Badge, Box, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { Add, Close, StopCircle, Upload } from "@mui/icons-material";
import MaterialReactTable from "material-react-table";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { useFormik } from "formik";
import { useFileContext } from "../contexts/file-context";
import { FormDialog, Progress } from "amps_ui_core";

import { useConfirm } from "material-ui-confirm";

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

const UploadForm = () => {
  const [open, setOpen] = React.useState(false);
  const { upload } = useFileContext();

  const submit = (values, formik) => {
    var meta = {};

    values.meta.map(({ field, value }) => {
      meta[field] = value;
    });
    upload(encodeURI("/api/upload/" + values.topic), values.file, meta, {
      topic: values.topic,
    });
    formik.handleReset();
    setOpen(false);
  };

  // const formik = useFormik({
  //   initialValues: { meta: {}, file: "null" },
  //   onSubmit: submit,
  // });

  return (
    <>
      <FormDialog
        open={open}
        title="Upload to Topic"
        setOpen={setOpen}
        fields={[
          {
            type: "select",
            name: "topic",
            label: "Topic",
            route: "/topics",
            valField: "topic",
            labelField: "topic",
            dynamic: true,
          },
          {
            type: "file",
            name: "file",
            label: "File",
          },
          {
            type: "arrayfield",
            name: "meta",
            label: "Metadata",
            arrayfields: [
              {
                type: "meta",
                name: "field",
                label: "Field",
              },
              {
                type: "text",
                name: "value",
                label: "Value",
              },
            ],
          },
        ]}
        // schema,
        onSubmit={submit}
        // collection,
        // preserve,
        submitText="Upload"
        // style = {}
      />
      <Tooltip arrow title="New" key="add">
        <IconButton onClick={() => setOpen(true)}>
          <Add fontSize="medium" />
        </IconButton>
      </Tooltip>
    </>
  );
};

export function Uploads() {
  const [open, setOpen] = React.useState(false);
  const [height, setHeight] = React.useState(500);
  const [width, setWidth] = React.useState(500);
  const confirm = useConfirm();

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), {
    defaultMatches: true,
    noSsr: false,
  });

  const { uploads, pending, useAuthContext, disabled } = useFileContext();

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
      <Tooltip title="Uploads" key="uploads">
        <IconButton
          onClick={handleClickOpen}
          disabled={disabled("/topics", "actions.upload")}
        >
          <Badge badgeContent={pending} color="primary">
            <Upload fontSize="medium" />
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
              Uploads
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
                    header: "Upload Progress",
                    accessorKey: "progress",
                    flex: 2,
                    Cell: ({ cell }) => {
                      var progress = cell.getValue() * 100;
                      return <Progress value={progress} />;
                    },
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                  },
                ]}
                data={uploads}
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
                    <IconButton
                      disabled={row.original.status != "Uploading"}
                      onClick={async () => {
                        confirm({
                          msg: "Are you sure you want to abort this upload?",
                        }).then(() => {
                          console.log(row.original);
                          row.original.request.abort();
                        });

                        // var title = "Delete Record";
                        // var msg = "Are you sure you want to delete?";
                      }}
                    >
                      <StopCircle fontSize="small" />
                    </IconButton>
                  );
                }}
                renderTopToolbarCustomActions={() => <UploadForm />}
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
