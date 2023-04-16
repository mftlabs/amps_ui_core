import React, { useEffect, useRef, useState, useId, useMemo } from "react";

import TextField from "@mui/material/TextField";

import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MUICheckbox from "@mui/material/Checkbox";
import MUISwitch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FormHelperText from "@mui/material/FormHelperText";
import { MuiFileInput } from "mui-file-input";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import {
  Add,
  CheckBox,
  Close,
  Create,
  Delete,
  Edit,
  Preview,
  Refresh,
  Replay,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  FormLabel,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Menu,
  MenuItem,
  MenuList,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { FieldArray, FormikProvider, useFormik } from "formik";
import MaterialReactTable from "material-react-table";
import { renderFields, useModal, Form, FormDialog } from "amps_ui_core";

const Field = ({ fields, readOnly, submit, values, idx }) => {
  const onSubmit = (values) => {
    submit(idx, values);
  };

  const formikfield = useFormik({
    onSubmit: onSubmit,
    initialValues: values,
    enableReinitialize: true,
  });

  return (
    <Box component="form" onSubmit={formikfield.handleSubmit}>
      {renderFields(formikfield, fields, readOnly)}
      <Button type="submit">Update</Button>
    </Box>
  );
};

export const FormBuilder = ({ field, formik }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onDelete = (index) => {
    var fields = formik.values[field.name];

    formik.setFieldValue(field.name, [
      ...fields.slice(0, index),
      ...fields.slice(index + 1),
    ]);
  };
  const [openForm, setOpenForm] = useState(false);

  const { modal, Modal } = useModal();

  const types = {
    text: {
      label: "Text Field",
      def: {
        type: "text",
        name: "",
        label: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
      ],
    },
    check: {
      label: "Checkbox",
      def: {
        type: "check",
        name: "",
        label: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
      ],
    },
    numberfield: {
      label: "Number Field",
      def: {
        type: "numberfield",
        name: "",
        label: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
      ],
    },
    select: {
      label: "Select Field",
      def: {
        type: "select",
        label: "",
        name: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
        {
          type: "check",
          name: "manual",
          label: "Manual Options?",
        },
        {
          type: "cond",
          name: "manual",
          cond: {
            true: [
              {
                type: "arrayfield",
                name: "options",
                label: "Options",
                arrayfields: [
                  {
                    type: "text",
                    name: "label",
                    label: "Label",
                  },
                  {
                    type: "text",
                    name: "field",
                    label: "Value",
                  },
                ],
              },
            ],
            false: [
              {
                type: "text",
                name: "route",
                label: "Route",
              },
              {
                type: "text",
                name: "labelField",
                label: "Label Field",
              },
              {
                type: "text",
                name: "valField",
                label: "Value Field",
              },
            ],
          },
        },
      ],
    },
    tags: {
      label: "Tag Field",
      def: {
        type: "tags",
        label: "",
        name: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
        {
          type: "check",
          name: "manual",
          label: "Manual Options?",
        },
        {
          type: "cond",
          name: "manual",
          cond: {
            true: [
              {
                type: "arrayfield",
                name: "options",
                label: "Options",
                arrayfields: [
                  {
                    type: "text",
                    name: "label",
                    label: "Label",
                  },
                  {
                    type: "text",
                    name: "field",
                    label: "Value",
                  },
                ],
              },
            ],
            false: [
              {
                type: "text",
                name: "route",
                label: "Route",
              },
              {
                type: "text",
                name: "labelField",
                label: "Label Field",
              },
              {
                type: "text",
                name: "valField",
                label: "Value Field",
              },
            ],
          },
        },
      ],
    },
    arrayfield: {
      label: "Array Field",
      def: {
        type: "arrayfield",
        arrayfields: [],
        label: "",
        name: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
        {
          type: "formbuilder",
          name: "arrayfields",
          label: "Array Fields",
        },
      ],
    },
    parms: {
      label: "Parameter Field",
      def: {
        type: "parms",
        label: "",
        name: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
      ],
    },
    datetime: {
      label: "DateTime",
      def: {
        type: "datetime",
        label: "",
        name: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
      ],
    },
    time: {
      label: "Time Field",
      def: {
        type: "time",
        label: "",
        name: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
      ],
    },
    json: {
      label: "Generic",
      def: {
        type: "json",
        label: "",
        name: "",
      },
      fields: [
        {
          type: "text",
          name: "label",
          label: "Label",
        },
        {
          type: "text",
          name: "name",
          label: "Name",
        },
      ],
    },
  };

  const submit = (idx, values) => {
    console.log(idx);
    console.log(values);
    var fields = formik.values[field.name];
    var nf = [...fields];
    nf[idx] = values;
    formik.setFieldValue(field.name, nf);
    modal.current.close();
  };

  const showField = (idx, data) => {
    modal.current.configure({
      title: "Edit Field",
      content: (
        <Field
          idx={idx}
          submit={submit}
          fields={[...types[data.type].fields]}
          readOnly={field.readOnly}
          values={data}
        />
      ),
    });
    modal.current.open();
  };

  return (
    <Box
      sx={{
        my: 1,
        opacity: field.readOnly ? 0.5 : 1,
        pointerEvents: field.readOnly ? "none" : "all",
      }}
    >
      <FormLabel>{field.label}</FormLabel>
      <MaterialReactTable
        columns={[
          {
            header: "Label",
            accessorKey: "label",
          },
          {
            header: "Name",
            accessorKey: "name",
          },
        ]}
        data={formik.values[field.name] || []}
        enablePagination={false}
        enableRowActions={true}
        muiTablePaperProps={{
          sx: { mt: 2 },
        }}
        renderRowActions={({ row }) => (
          <Box key="custom" sx={{ display: "flex", flexDirection: "row" }}>
            <IconButton
              onClick={() => {
                showField(row.index, row.original);
              }}
            >
              <Edit />
            </IconButton>

            <IconButton onClick={() => onDelete(row.index)}>
              <Delete />
            </IconButton>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Box key="custom" sx={{ display: "flex", flexDirection: "row" }}>
            {/* <Tooltip arrow title="Refresh Data" key="refresh">
              <IconButton sx={{ ml: 1 }} onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip> */}
            <Tooltip arrow title="Add Field" key="add">
              <IconButton sx={{ ml: 1 }} onClick={handleClick}>
                <Add />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Preview" key="preview">
              <IconButton
                sx={{ ml: 1 }}
                onClick={() => {
                  setOpenForm(true);
                }}
              >
                <Preview />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        enableRowOrdering
        enableSorting={false} //usually you do not want to sort when re-ordering
        muiTableBodyRowDragHandleProps={({ table }) => ({
          onDragEnd: () => {
            const { draggingRow, hoveredRow } = table.getState();
            if (hoveredRow && draggingRow) {
              var nf = [...formik.values[field.name]];
              nf.splice(
                hoveredRow.index,
                0,
                nf.splice(draggingRow.index, 1)[0]
              );
              formik.setFieldValue(field.name, nf);
            }
          },
        })}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuList dense>
          {Object.values(types).map(({ label, def }) => {
            return (
              <MenuItem
                onClick={() => {
                  var fields = formik.values[field.name];
                  var idx = fields.length;
                  formik.setFieldValue(field.name, [...fields, { ...def }]);
                  showField(idx, def);
                  handleClose();
                }}
              >
                {label}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
      <FormDialog
        title="Form Preview"
        submitText="Preview Output"
        open={openForm}
        setOpen={setOpenForm}
        fields={formik.values[field.name]}
        onSubmit={(values) => {
          modal.current.configure({
            title: "Preview Form Output",
            content: (
              <Box
                sx={{
                  backgroundColor: "#F4F4F4",
                  padding: "16px",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  fontSize: "14px",
                }}
              >
                {JSON.stringify(values, null, 2)}
              </Box>
            ),
          });
          modal.current.open();
        }}
      />
      <Modal ref={modal} />
    </Box>
  );
};
