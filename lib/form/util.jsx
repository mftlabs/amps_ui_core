import React, { useEffect, useRef, useState, useId, useMemo } from "react";

import TextField from "@mui/material/TextField";

import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import { queryFn, useQueryFn } from "../util/util";
import { Loader } from "../util/components/Loader";
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
import dayjs from "dayjs";
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import {
  Add,
  CheckBox,
  Close,
  Create,
  Delete,
  Refresh,
  Replay,
} from "@mui/icons-material";
import {
  Chip,
  FormLabel,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { FormAction } from "../util/grid";
import { FieldArray, FormikProvider } from "formik";
import MaterialReactTable from "material-react-table";
import { Toast } from "../util/components/Toast";
import { useMetadata } from "../hooks/useMetadata";
import Editor from "@monaco-editor/react";
import { Policy } from "./policy/Policy";
const DateTime = ({ field, formik }) => {
  return (
    <LocalizationProvider key={field.name} dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label={field.label}
        disabled={field.readOnly}
        renderInput={(params) => <TextField variant="standard" {...params} />}
        value={formik.values[field.name] || field.value}
        onChange={(e, value) => formik.setFieldValue(field.name, value)}
      />
    </LocalizationProvider>
  );
};

const Time = ({ field, formik }) => {
  const [time, setTime] = useState(
    formik.values[field.name] || field.value || null
  );

  useEffect(() => {
    if (formik.values[field.name]) {
      var time = formik.values[field.name].split(":");
      setTime(time);
    }
  }, [formik.values[field.name]]);

  return (
    <LocalizationProvider key={field.name} dateAdapter={AdapterDayjs}>
      <TimePicker
        label={field.label}
        disabled={field.readOnly}
        renderInput={(params) => <TextField variant="standard" {...params} />}
        value={
          time == null
            ? time
            : dayjs.utc().hour(time[0]).minute(time[1]).local()
        }
        onChange={(value) => {
          console.log(value);
          // var time = dayjs(value).format("HH:mm");
          var utc = dayjs.utc(value).format("HH:mm");

          // console.log(time);
          console.log(utc);
          formik.setFieldValue(field.name, utc);
        }}
      />
    </LocalizationProvider>
  );
};

const FileSize = ({ field, formik }) => {
  const blurTarget = (event) => {
    event.target instanceof HTMLElement && event.target.blur();
  };

  const [minVal, setMinVal] = useState(null);
  const [minUnit, setMinUnit] = useState(null);

  const [maxVal, setMaxVal] = useState(null);
  const [maxUnit, setMaxUnit] = useState(null);

  // const size = 7535678;

  const options = [
    { field: 1, label: "B" },
    { field: 1000, label: "KB" },
    { field: 1000000, label: "MB" },
    { field: 1000000000, label: "GB" },
  ];

  useEffect(() => {
    // var base = test % 1000;
    // var num = test / 1000;

    if (formik.values[field.name]?.["$gt"]) {
      var minSize = formik.values[field.name]["$gt"];
      var i = minSize == 0 ? 0 : Math.floor(Math.log(minSize) / Math.log(1000));
      setMinVal(minSize / Math.pow(1000, i));
      setMinUnit(1000 ** i);
    }
    if (formik.values[field.name]?.["$lt"]) {
      var maxSize = formik.values[field.name]["$lt"];
      var i = maxSize == 0 ? 0 : Math.floor(Math.log(maxSize) / Math.log(1000));
      setMaxVal(maxSize / Math.pow(1000, i));
      setMaxUnit(1000 ** i);
    }
  }, []);

  useEffect(() => {
    if (minUnit && minVal) {
      var val = minUnit * minVal;
      formik.setFieldValue(field.name, {
        ...formik.values[field.name],
        $gt: val,
      });
    }
  }, [minUnit, minVal]);

  useEffect(() => {
    if (maxUnit && maxVal) {
      var val = maxUnit * maxVal;
      formik.setFieldValue(field.name, {
        ...formik.values[field.name],
        $lt: val,
      });
    }
  }, [maxUnit, maxVal]);

  return (
    <Box>
      <FormLabel>{field.label}</FormLabel>
      <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
        <TextField
          variant="standard"
          disabled={field.readOnly}
          key={field.name + "min"}
          label={"Minimum Message Size"}
          sx={{ mx: 1, flex: 1 }}
          value={minVal}
          onChange={(e) => {
            setMinVal(e.target.value);
          }}
          onWheel={blurTarget}
        ></TextField>
        <Autocomplete
          disablePortal
          getOptionLabel={(option) => {
            if (option === "") {
              return "";
            } else if (typeof option === "object" && option !== null) {
              return option["label"];
            } else {
              return options.find((op) => op["field"] == option)["label"];
            }
          }}
          isOptionEqualToValue={(option, val) => {
            if (typeof val === "object" && val !== null) {
              return option["field"] == val["field"];
            } else {
              return option["field"] == val;
            }
          }}
          sx={{ flex: 1 }}
          options={options}
          value={minUnit}
          onChange={(e, value) => {
            setMinUnit(value.field);
          }}
          renderInput={(params) => (
            <TextField
              variant="standard"
              fullWidth={true}
              sx={{ mx: 1, flex: 1 }}
              {...params}
              label="Unit"
              // label={label}
            />
          )}
          // onChange={(e, value) => {
          //   onChange && onChange(formik, value);
          //   value ? formik.setFieldValue(name, value[valField]) : null;
          // }}
          // onBlur={formik.handleBlur}
          // error={formik.touched[name] && Boolean(formik.errors[name])}
          // helperText={formik.touched[name] && formik.errors[name]}
        />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
        <TextField
          variant="standard"
          disabled={field.readOnly}
          key={field.name + "max"}
          label={"Maximum Message Size"}
          sx={{ mx: 1, flex: 1 }}
          value={maxVal}
          onChange={(e) => {
            setMaxVal(e.target.value);
          }}
          onWheel={blurTarget}
        ></TextField>
        <Autocomplete
          disablePortal
          getOptionLabel={(option) => {
            if (option === "") {
              return "";
            } else if (typeof option === "object" && option !== null) {
              return option["label"];
            } else {
              return options.find((op) => op["field"] == option)["label"];
            }
          }}
          isOptionEqualToValue={(option, val) => {
            if (typeof val === "object" && val !== null) {
              return option["field"] == val["field"];
            } else {
              return option["field"] == val;
            }
          }}
          sx={{ flex: 1 }}
          options={options}
          value={maxUnit}
          onChange={(e, value) => {
            setMaxUnit(value.field);
          }}
          renderInput={(params) => (
            <TextField
              variant="standard"
              fullWidth={true}
              sx={{ mx: 1, flex: 1 }}
              {...params}
              label="Unit"
              // label={label}
            />
          )}
          // onChange={(e, value) => {
          //   onChange && onChange(formik, value);
          //   value ? formik.setFieldValue(name, value[valField]) : null;
          // }}
          // onBlur={formik.handleBlur}
          // error={formik.touched[name] && Boolean(formik.errors[name])}
          // helperText={formik.touched[name] && formik.errors[name]}
        />
      </Box>
    </Box>
  );
};

const Range = ({ field, formik }) => {
  useEffect(() => {
    var upd = {};
    if (!formik.values[field.name]?.["$lt"]) {
      upd["$lt"] = null;
    }
    if (!formik.values[field.name]?.["$gt"]) {
      upd["$gt"] = null;
    }
    formik.setFieldValue(field.name, {
      ...formik.values[field.name],
      ...upd,
    });
  }, []);

  return (
    <LocalizationProvider key={field.name} dateAdapter={AdapterDayjs}>
      <FormLabel>{field.label}</FormLabel>
      <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
        <DateTimePicker
          label="From"
          renderInput={(params) => (
            <TextField sx={{ flex: 1, mx: 1 }} variant="standard" {...params} />
          )}
          value={
            formik.values[field.name]?.["$gt"]
              ? dayjs(formik.values[field.name]["$gt"])
              : null
          }
          inputFormat="MM/DD/YYYY hh:mm:ss A"
          views={["year", "day", "hours", "minutes", "seconds"]}
          onChange={(value) => {
            if (value.isValid()) {
              var iso = value.toISOString();

              formik.setFieldValue(field.name, {
                ...formik.values[field.name],
                $gt: iso,
              });
            }
          }}
        />
        <DateTimePicker
          label="To"
          renderInput={(params) => (
            <TextField sx={{ flex: 1, mx: 1 }} variant="standard" {...params} />
          )}
          value={
            formik.values[field.name]?.["$lt"]
              ? dayjs(formik.values[field.name]["$lt"])
              : null
          }
          inputFormat="MM/DD/YYYY hh:mm:ss A"
          views={["year", "day", "hours", "minutes", "seconds"]}
          onChange={(value) => {
            if (value.isValid()) {
              var iso = value.toISOString();

              formik.setFieldValue(field.name, {
                ...formik.values[field.name],
                $lt: iso,
              });
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

const DisplayField = ({ field, formik }) => {
  return (
    <TextField
      variant="outlined"
      disabled={field.readOnly}
      inputProps={{ readOnly: true }}
      key={field.name}
      fullWidth={true}
      id={field.name}
      name={field.name}
      label={field.label}
      value={formik.values?.[field.name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
      helperText={formik.touched[field.name] && formik.errors[field.name]}
    />
  );
};

const File = ({ field, formik }) => {
  const [file, setFile] = useState(null);

  const handleChange = (newFile) => {
    formik.setFieldValue(field.name, newFile);

    setFile(newFile);
  };

  return (
    <MuiFileInput
      label={field.label}
      variant="standard"
      sx={{ flex: 1 }}
      value={file}
      onChange={handleChange}
    />
  );
};

const FileInput = ({ field, formik }) => {
  const [file, setFile] = useState(null);

  const handleChange = (newFile) => {
    var reader = new FileReader();
    reader.readAsBinaryString(newFile);
    reader.onload = function (evt) {
      formik.setFieldValue(field.name, evt.target.result);
    };
    setFile(newFile);
  };

  return (
    <Box key={field.name} sx={{ display: "flex", flexDirection: "row" }}>
      <MuiFileInput
        label={field.label}
        variant="standard"
        sx={{ flex: 1 }}
        value={file}
        onChange={handleChange}
      />
      <TextField
        variant="standard"
        type="textarea"
        key={field.name}
        id={field.name}
        name={field.name}
        label={field.label}
        value={formik.values?.[field.name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.values[field.name] && Boolean(formik.errors[field.name])}
        helperText={formik.values[field.name] && formik.errors[field.name]}
      />
    </Box>
  );
};

const Flag = ({ formik, label, name, readOnly }) => {
  return (
    <FormControlLabel
      sx={{ mx: 0, height: 0, width: 0 }}
      control={<Box>{formik.values[name]}</Box>}
      // label={label}
      disabled={readOnly}
      key={name}
      labelPlacement="start"
      name={name}
      value={formik.values[name]}
      onChange={formik.handleChange}
    />
  );
};

const Check = ({ formik, label, name, readOnly, value, onChange }) => {
  const [checked, setChecked] = useState(
    formik.values[name] === undefined ? value : formik.values[name]
  );

  useEffect(() => {
    formik.setFieldValue(name, checked);
  }, [checked]);

  useEffect(() => {
    onChange && onChange(formik, formik.values[name]);
  }, []);

  return (
    <FormControlLabel
      key={name}
      control={<MUICheckbox checked={checked} />}
      disabled={readOnly}
      label={label}
      name={name}
      onChange={(e, v) => {
        onChange && onChange(formik, !checked);
        setChecked(!checked);
      }}
    />
  );
};

export const NumberField = ({ field, formik }) => {
  const blurTarget = (event) => {
    event.target instanceof HTMLElement && event.target.blur();
  };

  useEffect(() => {
    if (field.value && !formik.values[field.name]) {
      formik.setFieldValue(field.name, field.value);
    }
  }, []);

  return (
    <TextField
      variant="standard"
      disabled={field.readOnly}
      key={field.name}
      fullWidth={true}
      id={field.name}
      name={field.name}
      label={field.label}
      value={formik.values?.[field.name] ?? field.value}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.values[field.name] && Boolean(formik.errors[field.name])}
      helperText={formik.values[field.name] && formik.errors[field.name]}
      type="number"
      inputProps={{ min: field.minValue, max: field.maxValue, step: "1" }}
      onWheel={blurTarget}
    ></TextField>
  );
};

function Metadata(props) {
  const { data, isLoading, isFetching } = useMetadata();

  return data ? (
    <Select options={data} valField="field" labelField="desc" {...props} />
  ) : (
    <Loader />
  );
}

function Select({
  formik,
  route,
  filter,
  name,
  label,
  labelField = "label",
  valField = "field",
  options,
  readOnly,
  value = null,
  submitValue = true,
  dynamic,
  onChange = () => null,
  sx,
  ...other
}) {
  const [selected, setSelected] = useState(null);
  const queryFn = useQueryFn();

  const {
    data,
    isError,
    status,
    isFetching,
    isLoading,
    refetch,
    remove,
    error,
  } = useQuery({
    queryKey: [
      route ? (route instanceof Function ? route(formik) : route) : label,
      filter, //refetch when sorting changes
    ],
    queryFn: () => {
      return route
        ? queryFn(route instanceof Function ? route(formik) : route, filter)
        : options instanceof Function
        ? options(formik)
        : options;
    },
    keepPreviousData: true,
    retry: false,
  });

  useEffect(() => {
    refetch();
  }, [options]);

  useEffect(() => {
    if (selected && formik && submitValue) {
      formik.setFieldValue(name, selected[valField]);
    }
  }, [selected]);

  // useEffect(() => {
  //   if (selected) {
  //     formik.setFieldValue(name, selected[valField]);
  //   }
  // }, [data]);

  useEffect(() => {
    console.log(name);
    console.log(data);
    console.log(formik.values);
    if (data && formik.values[name]) {
      console.log(name);
      console.log(data.find((d) => d[valField] == formik.values[name]));
      setSelected(data.find((d) => d[valField] == formik.values[name]));
    } else if (data && value) {
      setSelected(data.find((d) => d[valField] == value));
    }
  }, [data]);

  useEffect(() => {
    if (data && formik.values[name]) {
      onChange(
        formik,
        data.find((d) => d[valField] == formik.values[name])
      );
      return;
    } else if (data && value) {
      onChange(
        formik,
        data.find((d) => d[valField] == value)
      );
      return;
    }
  }, [data]);

  return isLoading && !isError ? (
    <Loader key={name} />
  ) : (
    <>
      <Box key={name} sx={{ display: "flex", flexDirection: "row", ...sx }}>
        <Autocomplete
          disabled={readOnly || error}
          // disablePortal
          disableClearable={true}
          id={name}
          getOptionLabel={(option) => {
            if (option === "") {
              return "";
            } else if (typeof option === "object" && option !== null) {
              return option[labelField];
            } else {
              return data.find((op) => op[valField] == option)[labelField];
            }
          }}
          isOptionEqualToValue={(option, val) => {
            if (typeof val === "object" && val !== null) {
              return option[valField] == val[valField];
            } else {
              return option[valField] == val;
            }
          }}
          name={name}
          label={label}
          value={selected}
          options={error ? [] : data}
          sx={{ flex: 1 }}
          renderInput={(params) => (
            <TextField
              variant="standard"
              fullWidth={true}
              {...params}
              label={label}
            />
          )}
          onChange={(e, value) => {
            onChange && onChange(formik, value);
            setSelected(value);
          }}
          onBlur={formik.handleBlur}
        />
        {dynamic && (
          <>
            <FormAction route={route} disabled={readOnly} refetch={refetch} />
            <IconButton size="medium" disabled={readOnly}>
              <Replay
                onClick={() => {
                  refetch();
                }}
              />
            </IconButton>
          </>
        )}
      </Box>

      <FormHelperText
        error={
          error
            ? Boolean(error)
            : formik.values[name] && Boolean(formik.errors[name])
        }
      >
        {error
          ? error.status == 403
            ? "Permission Denied"
            : error.data.error
          : formik.values[name] && formik.errors[name]}
      </FormHelperText>
    </>
  );
}

const Parm = ({
  parms,
  setParms,
  name,
  formik,
  index,
  type,

  field: fld,
  value: val,
  readOnly,
}) => {
  const [field, setField] = useState(fld);
  const [value, setValue] = useState(val);
  const blurTarget = (event) => {
    event.target instanceof HTMLElement && event.target.blur();
  };

  // useEffect(() => {
  //   console.log(type);
  //   if (type == "boolean" && !val) {
  //     setValue(false);
  //   }
  // }, []);

  useEffect(() => {
    if (fld) {
      setField(fld);
    }

    if (val) {
      setValue(val);
    }

    // formik.setFieldValue();
  }, [fld, val]);

  useEffect(() => {
    console.log(field);
    console.log(value);
    const newParms = [...parms];
    newParms[index] = {
      field: field,
      value: type == "number" ? +value : value,
      type: type,
    };

    setParms(newParms);

    // formik.setFieldValue();
  }, [field, value]);

  const key = useMemo(() => ({
    type: "select",
    valField: "_id",
    labelField: "name",
    route: "/keys",
    label: "Key",
    sx: { flex: 1 },
    submitValue: false,
    onChange: (formik, value) => setValue({ key: value["_id"] }),
  }));

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "row" }}>
      <TextField
        variant="standard"
        disabled={readOnly}
        key={index + "field"}
        id={index + "field"}
        label="Field"
        value={field}
        onChange={(e) => {
          setField(e.target.value);
        }}
        sx={{ flex: 1, mx: 1 }}
        // onBlur={formik.handleBlur}
        // error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
        // helperText={formik.touched[field.name] && formik.errors[field.name]}
      />
      {type == "string" && (
        <TextField
          variant="standard"
          disabled={readOnly}
          key={index + "value"}
          id={index + "value"}
          label="String"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          sx={{ flex: 1, mx: 1 }}
          // onBlur={formik.handleBlur}
          // error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
          // helperText={formik.touched[field.name] && formik.errors[field.name]}
        />
      )}
      {type == "number" && (
        <TextField
          variant="standard"
          disabled={readOnly}
          key={index + "value"}
          id={index + "value"}
          label="Number"
          value={value}
          sx={{ flex: 1, mx: 1 }}
          onChange={(e) => setValue(e.target.value)}
          // onBlur={formik.handleBlur}
          // error={
          //   formik.touched[field.name] && Boolean(formik.errors[field.name])
          // }
          // helperText={formik.touched[field.name] && formik.errors[field.name]}
          // type="number"
          // inputProps={{ min: field.minValue, max: field.maxValue, step: "1" }}
          onWheel={blurTarget}
        ></TextField>
      )}
      {type == "boolean" && (
        <FormControlLabel
          key={index + "value"}
          id={index + "value"}
          label="Boolean"
          control={<MUICheckbox checked={value} />}
          disabled={readOnly}
          onChange={(e, v) => {
            setValue(!value);
          }}
          sx={{ flex: 1, mx: 1 }}
        />
      )}
      {type == "key" && (
        <Select
          sx={{ flex: 1, mx: 1 }}
          key={index + "key"}
          id={index + "key"}
          {...key}
          formik={formik}
        />
      )}
    </Box>
  );
};

const Parms = ({ field, formik }) => {
  const [parms, setParms] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [fQueue, setFQueue] = useState([]);
  const [pQueue, setPQueue] = useState([]);
  const types = useMemo(
    () => field.types || ["string", "number", "boolean", "key"],
    [field.types]
  );

  const [init, setInit] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // console.log(parms);
    if (!fQueue.length) {
      var ps = {};
      parms.forEach(({ field, value }) => {
        ps[field] = value;
      });
      // console.log(ps);
      setPQueue((curr) => [...curr, true]);
      formik.setFieldValue(field.name, ps);
    }
    setFQueue((curr) => {
      curr.pop();
      return curr;
    });
  }, [parms]);

  useEffect(() => {
    if (!pQueue.length) {
      if (formik.values[field.name]) {
        var p = Object.entries(formik.values[field.name]).map(([key, val]) => {
          var type;
          if (
            typeof yourVariable === "object" &&
            !Array.isArray(yourVariable) &&
            yourVariable !== null
          ) {
            type = "key";
          } else {
            type = typeof val;
          }
          console.log(val);
          return {
            field: key,
            value: type == "key" ? val["key"] : val,
            type: type,
          };
        });
        // console.log("Setting Parms");
        setFQueue((curr) => [...curr, true]);
        setParms(p);
      }
    }
    setPQueue((curr) => {
      curr.pop();
      return curr;
    });
  }, [formik.values[field.name]]);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <Box>
      <FormLabel key="label">
        {field.label}
        {parms.map((obj, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Parm
              parms={parms}
              setParms={setParms}
              name={field.name}
              formik={formik}
              index={index}
              readOnly={field.readOnly}
              {...obj}
            />
            <Box>
              <IconButton
                disabled={field.readOnly}
                onClick={() => {
                  console.log(index);
                  var n = parms.filter((parm, idx) => idx !== index);
                  console.log(n);
                  setParms((current) =>
                    current.filter((parm, idx) => idx !== index)
                  );
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
        ))}
      </FormLabel>
      <IconButton
        disabled={field.readOnly}
        type="button"
        className="secondary"
        onClick={handleClick}
      >
        <Add />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <List>
          {[
            { type: "string", value: "", label: "String" },
            { type: "number", value: 0, label: "Number" },
            { type: "boolean", value: false, label: "Boolean" },
            { type: "key", value: "", label: "Key" },
          ]
            .filter((n) => types.includes(n.type))
            .map(({ type, value, label }) => {
              return (
                <ListItemButton
                  onClick={() => {
                    setParms([
                      ...parms,
                      { field: "", value: value, type: type },
                    ]);
                  }}
                >
                  {label}
                </ListItemButton>
              );
            })}
        </List>
      </Popover>
    </Box>
  );
};

function ArrayField({ field, formik }) {
  return (
    <FormikProvider value={formik}>
      <FormLabel key="label">{field.label}</FormLabel>
      <FieldArray
        name={field.name}
        render={({ insert, remove, push }) => (
          <>
            {formik.values[field.name]?.length > 0 &&
              formik.values[field.name].map((obj, index) => {
                console.log(obj);
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      {renderFields(
                        formik,
                        field.arrayfields.map((af) => {
                          return {
                            ...af,
                            value: obj[af.name],
                            name: `${field.name}.${index}.${af.name}`,
                          };
                        }),
                        field.readOnly,
                        true
                      )}
                    </Box>
                    <Box>
                      <IconButton onClick={() => remove(index)}>
                        <Close />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            <IconButton
              type="button"
              className="secondary"
              onClick={() => push(loadValues({}, field.arrayfields))}
            >
              <Add />
            </IconButton>
          </>
        )}
      ></FieldArray>
    </FormikProvider>
  );
}

function CollectionList({
  route,
  columns,
  name,
  label,
  filter = {},
  options,
  formik,
  valField = "_id",
  readOnly,
}) {
  const [curr, setCurr] = useState(null);
  const [open, setOpen] = useState(false);
  const [tableData, setTableData] = useState([]);

  const valueRef = useRef(formik.values[name]);
  useEffect(() => {
    valueRef.current = formik.values[name];
  });

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      route ? route : label,
      filter, //refetch when sorting changes
    ],
    queryFn: () => {
      return route ? queryFn(route, filter) : options;
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data && formik.values[name]) {
      var td = formik.values[name].map((e) =>
        data.find((v) => v[valField] == e)
      );
      console.log(td);
      console.log(formik.values[name]);
      setTableData(td);
    }
  }, [formik.values[name], data]);

  const onDelete = (index) => {
    console.info(valueRef.current);
    console.log(valueRef.current.filter((data, idx) => idx !== index));
    formik.setFieldValue(
      name,
      valueRef.current.filter((data, idx) => idx !== index)
    );
  };

  return (
    <>
      <FormLabel>{label}</FormLabel>
      <Box
        sx={{
          my: 1,
          opacity: readOnly ? 0.5 : 1,
          pointerEvents: readOnly ? "none" : "all",
        }}
      >
        {/* <FormikProvider formik={formik}>
          <FieldArray
            name={name}
            formik={formik}
            validateOnChange={false}
            render={({ push, insert, remove }) => ( */}
        <MaterialReactTable
          columns={columns}
          data={tableData}
          enablePagination={false}
          enableRowActions={true}
          renderRowActions={({ row }) => (
            <IconButton onClick={() => onDelete(row.index)}>
              <Delete />
            </IconButton>
          )}
          renderTopToolbarCustomActions={() => (
            <Box key="custom" sx={{ display: "flex", flexDirection: "row" }}>
              <Autocomplete
                // disablePortal
                options={data}
                getOptionLabel={(option) => option.name}
                sx={{ flex: 1, width: "12rem" }}
                onChange={(e, value) => {
                  setCurr(value);
                }}
                value={curr}
                renderInput={(params) => (
                  <TextField
                    variant="standard"
                    fullWidth={true}
                    sx={{ mx: 1, flex: 1 }}
                    {...params}
                    // label={label}
                  />
                )}
                // onChange={(e, value) => {
                //   onChange && onChange(formik, value);
                //   value ? formik.setFieldValue(name, value[valField]) : null;
                // }}
                // onBlur={formik.handleBlur}
                // error={formik.touched[name] && Boolean(formik.errors[name])}
                // helperText={formik.touched[name] && formik.errors[name]}
              />
              <Tooltip arrow title="Add" key="refresh">
                <IconButton
                  onClick={() => {
                    if (curr) {
                      var l = formik.values[name] || [];
                      if (l.some((e) => e === curr._id)) {
                        setOpen(true);
                      } else {
                        formik.setFieldValue(name, [...l, curr[valField]]);
                      }
                      setCurr(null);
                    }
                    console.log(formik.values[name]);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
              <Toast
                severity="error"
                msg="Item already in list"
                open={open}
                setOpen={setOpen}
              />
              <Tooltip arrow title="Refresh Data" key="refresh">
                <IconButton onClick={() => refetch()}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title="Refresh Data" key="create">
                <IconButton onClick={() => refetch()}>
                  <Create />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          enableRowOrdering
          enableSorting={false} //usually you do not want to sort when re-ordering
          muiTableBodyRowDragHandleProps={({ table }) => ({
            onDragEnd: () => {
              console.log(tableData);
              const { draggingRow, hoveredRow } = table.getState();
              console.log(valueRef.current);
              if (hoveredRow && draggingRow) {
                valueRef.current.splice(
                  hoveredRow.index,
                  0,
                  valueRef.current.splice(draggingRow.index, 1)[0]
                );
                formik.setFieldValue(
                  name,
                  valueRef.current.map((e) => e)
                );
              }
            },
          })}
        />
        {/* )}
          />
        </FormikProvider> */}
      </Box>
    </>
  );

  //     {
  //       xtype: "collectionlist",
  //       name: "router",
  //       collection: "endpoints",
  //       columns: [
  //         {
  //           text: "Method",
  //           dataIndex: "method",
  //           flex: 1,
  //         },
  //         {
  //           text: "Path",
  //           dataIndex: "path",
  //           flex: 1,
  //         },
  //         amfutil.buttonColumn("Action", "action", "actions"),
  //       ],
  //     },
}

export function Tags({
  formik,
  route,
  filter,
  name,
  label,
  labelField = "label",
  valField = "field",
  options,
  readOnly,
  value = [],
  submitValue = true,
  onChange = () => null,
}) {
  const queryFn = useQueryFn();
  const [selected, setSelected] = useState([]);
  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      route ? (route instanceof Function ? route(formik) : route) : label,
      filter, //refetch when sorting changes
    ],
    queryFn: () => {
      return route
        ? queryFn(route instanceof Function ? route(formik) : route, filter)
        : options instanceof Function
        ? options(formik)
        : options;
    },
    keepPreviousData: true,
  });
  useEffect(() => {
    if (selected && formik && submitValue) {
      formik.setFieldValue(
        name,
        selected.map((v) => v[valField])
      );
    }
  }, [selected]);

  useEffect(() => {
    if (data && formik.values[name]) {
      var s = formik.values[name].map((v) => {
        return data.find((d) => d[valField] == v);
      });

      onChange(formik, s);
      setSelected(s);
    } else if (data && value) {
      var s = value.map((v) => {
        return data.find((d) => d[valField] == v);
      });

      onChange(formik, s);
      setSelected(s);
    }
  }, [data]);

  return isLoading ? (
    <Loader key={name} />
  ) : (
    <Autocomplete
      multiple
      // id="tags-standard"
      disabled={readOnly}
      options={data}
      getOptionLabel={(option) => option[labelField]}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label={label}
          // placeholder="Favorites"
        />
      )}
      isOptionEqualToValue={(option, val) => {
        if (typeof val === "object" && val !== null) {
          return option[valField] == val[valField];
        } else {
          return option[valField] == val;
        }
      }}
      value={selected}
      onChange={(e, value) => {
        onChange && onChange(formik, value);
        setSelected(value);
      }}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
    />
  );
}

export function parseForm(form) {
  const fd = new FormData(form);
  const data = {};

  for (var p of fd) {
    var v = p[1];
    if (!(p[1] == "") && !isNaN([p[1]])) {
      var el = form.elements[p[0]];
      if (el.getAttribute("type") == "number" || el.dataset.convertnumber) {
        v = +p[1];
      }
    }
    var curr = data;
    var keys = p[0].split(".");
    keys.forEach((key, idx) => {
      if (idx == keys.length - 1) {
        curr[key] = v;
      } else {
        if (!(key in curr)) {
          curr[key] = {};
        }

        curr = curr[key];
      }
    });
  }
  return data;
}

export const Text = ({ field, formik, sx = {} }) => {
  const [password, setPassword] = useState(Boolean(field.inputType));
  useEffect(() => {
    if (field.value && !formik.values[field.name]) {
      formik.setFieldValue(field.name, field.value);
    }
  }, []);

  const deepGet = (obj, keys) =>
    keys.reduce(
      (xs, x) => (xs && xs[x] !== null && xs[x] !== undefined ? xs[x] : null),
      obj
    );

  return (
    <TextField
      sx={sx}
      variant={field.variant || "standard"}
      disabled={field.readOnly}
      key={field.name}
      fullWidth={true}
      type={password ? "password" : undefined}
      id={field.name}
      InputLabelProps={field.readOnly ? { shrink: true } : {}}
      InputProps={
        field.inputType == "password"
          ? {
              endAdornment: (
                <IconButton
                  tabIndex="-1"
                  onMouseDown={() => setPassword(!password)}
                  onMouseUp={() => setPassword(!password)}
                >
                  <InputAdornment position="end">
                    <VisibilityIcon />
                  </InputAdornment>
                </IconButton>
              ),
            }
          : {}
      }
      name={field.name}
      label={field.label}
      value={deepGet(formik.values, field.name.split(".")) || field.value}
      onChange={(e) => {
        var val = e.target.value;
        field.onChange && field.onChange(formik, val);
        formik.setFieldValue(field.name, val);
      }}
      onBlur={formik.handleBlur}
      error={Boolean(deepGet(formik.errors, field.name.split(".")))}
      helperText={deepGet(formik.errors, field.name.split("."))}
    />
  );
};

const JSON = ({ field, formik }) => {
  const editorCustomOptions = {
    glyphMargin: true,
    lightbulb: {
      enabled: true,
    },
    fixedOverflowWidgets: true,
    padding: { top: 16 },
  };
  const onChange = (value) => {
    formik.setFieldValue(field.name, value);
  };

  const onMount = (editor) => {
    editor.updateOptions({ readOnly: field.readOnly });
  };

  return (
    <Box sx={{ opacity: field.readOnly ? 0.7 : 1 }}>
      <FormLabel>{field.label}</FormLabel>
      <FormHelperText error={formik.errors[field.name]}>
        {formik.errors[field.name]}
      </FormHelperText>
      <Editor
        options={editorCustomOptions}
        height="60vh"
        defaultLanguage="json"
        onMount={onMount}
        onChange={onChange}
        theme="vs-dark"
        value={formik.values[field.name]}
      />
    </Box>
  );
};

export const fieldtypes = {
  policy: (field, formik) => {
    return <Policy formik={formik} field={field} />;
  },
  fileSize: (field, formik) => {
    return <FileSize formik={formik} field={field} />;
  },
  range: (field, formik) => {
    return <Range formik={formik} field={field} />;
  },
  display: (field, formik) => {
    return <DisplayField formik={formik} field={field} />;
  },
  arrayfield: (field, formik) => {
    return <ArrayField formik={formik} field={field} />;
  },
  parms: (field, formik) => {
    return <Parms formik={formik} field={field} />;
  },
  collectionlist: (field, formik) => {
    return <CollectionList formik={formik} {...field} />;
  },
  datetime: (field, formik) => {
    return <DateTime formik={formik} field={field} />;
  },
  time: (field, formik) => {
    return <Time formik={formik} field={field} />;
  },
  flag: (field, formik) => {
    return <Flag formik={formik} {...field} />;
  },
  fileinput: (field, formik) => {
    return <FileInput formik={formik} field={field} />;
  },
  file: (field, formik) => {
    return <File formik={formik} field={field} />;
  },
  numberfield: (field, formik) => {
    return <NumberField formik={formik} field={field} />;
  },
  check: (field, formik) => {
    return <Check formik={formik} {...field} />;
  },
  meta: (field, formik) => {
    return <Metadata formik={formik} {...field} />;
  },
  select: (field, formik) => {
    return <Select formik={formik} {...field} />;
  },
  tags: (field, formik) => {
    return <Tags formik={formik} {...field} />;
  },
  text: (field, formik) => {
    return <Text field={field} formik={formik} />;
  },
  json: (field, formik) => {
    return <JSON field={field} formik={formik} />;
  },
};

const Renderer = ({ formik, render, readOnly }) => {
  return renderFields(formik, [render(formik)], readOnly);
};

export const renderFields = (
  formik,
  fields,
  readOnly = false,
  pairs = false,
  stat = []
) => {
  var pair = [];
  var fs = [];
  Object.entries(stat).forEach(([name, val]) => {
    var idx = fields.findIndex((f) => f.name == name);
    if (idx >= 0) {
      fields[idx].value = val;
      fields[idx].readOnly = true;
    }
  });
  for (let i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (field.type == "cond") {
      fs.push(
        <>
          {Object.entries(field.cond).map(([val, fields]) => {
            if (typeof formik.values[field.name] == "boolean") {
              val = val === "true";
            }
            var fval = formik.values[field.name];
            if (fval && field.valField) {
              fval = fval[field.valField];
            }

            // console.log(fval, val);
            return (
              fval == val && renderFields(formik, fields, readOnly, pairs, stat)
            );
          })}
        </>
      );
    } else if (field.type == "renderer") {
      fs.push(<Renderer formik={formik} {...field} readOnly={readOnly} />);
    } else {
      if (pairs) {
        pair.push(
          <Box sx={{ py: 2, mx: 1, flex: 1 }}>
            {fieldtypes[field.type](
              { ...field, ...{ ...(readOnly ? { readOnly: readOnly } : {}) } },
              formik
            )}
          </Box>
        );
        if (pair.length == 2 || i == fields.length - 1) {
          fs.push(
            <Box sx={{ display: "flex", flexDirection: "row" }}>{pair}</Box>
          );
          pair = [];
        }
      } else {
        fs.push(
          <Box sx={{ py: 1, mx: 1 }}>
            {fieldtypes[field.type](
              { ...field, ...{ ...(readOnly ? { readOnly: readOnly } : {}) } },
              formik
            )}
          </Box>
        );
      }
    }
  }
  return fs;
};

export const loadValues = (obj = {}, fields, values = {}) => {
  fields.forEach((f) => {
    if (f.type != "cond" && f.type != "renderer") {
      if (values[f.name] !== undefined) {
        obj[f.name] = values[f.name];
      } else if (f.value) {
        obj[f.name] = f.value;
      } else if (f.type === "check" || f.type === "switch") {
        obj[f.name] = false;
      } else if (f.type == "range") {
        obj[f.name] = {};
      } else if (["arrayfield", "collectionlist"].includes(f.type)) {
        obj[f.name] = [];
      } else {
        obj[f.name] = "";
      }
    }
  });
  return obj;
};

export const arrayToObject = (array, valField) => {
  var o = {};

  array.forEach(({ [valField]: field, ...others }) => {
    o[field] = others;
  });
  return o;
};

export const objectToArray = (object, valField) => {
  var a = Object.entries(object).map(([key, val]) => {
    return {
      [valField]: key,
      ...val,
    };
  });
  return a;
};
