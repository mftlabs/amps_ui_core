import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { queryFn, useQueryFn } from "./util";
import { Loader } from "./components/Loader";
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FormDialog } from "../form/FormDialog";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { RecursiveMenu } from "../layout/RecursiveMenu";
export const dateRenderer = ({ cell }) => {
  var val = cell.getValue();
  if (val) {
    return formatDate(val);
  }
};

export const formatDate = (val) => {
  var date = new Date(val);
  var milli = val.split(".")[1].substring(0, 3);
  var str = date.toLocaleString();

  return str.substring(0, str.length - 3) + ":" + milli + str.slice(-3);
};

import { request } from "./util";
import { Edit, Search, SearchOff } from "@mui/icons-material";
import {
  Badge,
  Button,
  ClickAwayListener,
  Popper,
  Typography,
} from "@mui/material";
import { useUIContext } from "../contexts/UIContext";
import { toast } from "react-toastify";

export const idRenderer = ({ cell }, route) => {
  const queryFn = useQueryFn();
  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [route],
    queryFn: () => queryFn(route),
    keepPreviousData: true,
    enabled: Boolean(cell.getValue()),
  });

  if (cell.getValue() && data) {
    return isLoading || isFetching ? (
      <Loader />
    ) : (
      data.find((d) => d._id == cell.getValue()).name
    );
  } else {
    return cell.getValue();
  }
};

export const fileSizeRenderer = ({ cell, row }) => {
  var size = cell.getValue();
  if (size == null) {
    if (row.original.data) {
      size = new Blob([row.original.data]).size;
    } else {
      return "Not Applicable";
    }
  }
  return formatFileSize(size);
};

export const formatFileSize = (size) => {
  var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1000));
  return (
    (size / Math.pow(1000, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
};

export const FormAction = forwardRef(
  (
    {
      route,
      refetch,
      style = {},
      stat = {},
      update,
      disabled = false,
      text = null,
      submit,
      values,
      preserve,
      submitText,
      title: defaultTitle,
      icon,
      ...other
    },
    ref
  ) => {
    const { pages, formfields, useSchemas } = useUIContext();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("Create New");
    const [config, setConfig] = useState(null);
    const [fields, setFields] = useState(null);
    const [field, setField] = useState(null);
    const [collection, setCollection] = useState(null);
    const [entityId, setEntityId] = useState(null);
    const { getSchema } = useSchemas();
    const process = useRef();

    useImperativeHandle(
      ref,
      () => {
        return {
          close: () => setOpen(false),
        };
      },
      []
    );

    useEffect(() => {
      const tokens = route.substring(1).split("/");
      var config;
      setCollection(tokens[0]);
      if (tokens.length > 2) {
        config = pages[tokens[0]].subpages[tokens[2]];
        setField(tokens[2]);

        setEntityId(tokens[1]);
      } else {
        config = pages[tokens[0]];
      }
      setConfig(config);
      var fields =
        tokens.length > 2
          ? formfields[tokens[0]].subpages[tokens[2]]
          : formfields[tokens[0]].root;

      if (tokens.length <= 2) {
        if (formfields[tokens[0]]?.add?.process) {
          process.current = formfields[tokens[0]].add.process;
        } else {
          process.current = (val) => val;
        }
      } else {
        if (config.add?.process) {
          process.current = config.add.process;
        } else {
          process.current = (val) => val;
        }
      }

      // console.log(fields);
      setFields(fields);
      setTitle(
        defaultTitle
          ? defaultTitle
          : update
          ? `Update ${config.object}`
          : `Create New ${config.object}`
      );
    }, []);

    const onSubmit = (data, formik) => {
      var values = process.current(data) ?? data;

      if (entityId) {
        delete values._entity;
      }

      console.log(values);
      request({
        url: `/api${route}`,
        method: "post",
        data: values,
      })
        .then(() => {
          refetch();
          toast.success(`${config.object} Successfully Created`);
          setOpen(false);
          formik.handleReset();
        })
        .catch(() => {
          toast.error(`Failed to create ${config.object}`);
        });
    };

    return (
      <>
        {config && (
          <FormDialog
            onSubmit={submit ? submit : onSubmit}
            values={values}
            style={style}
            open={open}
            setOpen={setOpen}
            refetch={refetch}
            title={title}
            entityId={entityId}
            field={field}
            update={update}
            route={route}
            stat={stat}
            collection={collection}
            fields={fields}
            schema={getSchema(collection, field, {})}
            preserve={preserve}
            submitText={submitText}
            {...other}
          />
        )}
        <Tooltip
          arrow
          title={update ? "Edit" : "New"}
          key={update ? "update" : "add"}
        >
          {text ? (
            <Button
              disabled={disabled && !update}
              onClick={() => setOpen(true)}
              sx={{ flex: 1, justifyContent: "flex-end" }}
              endIcon={update ? <Edit /> : <AddIcon />}
            >
              <Typography sx={{ fontSize: 14 }}>{text}</Typography>
            </Button>
          ) : (
            <IconButton
              disabled={disabled && !update}
              onClick={() => setOpen(true)}
            >
              {icon ? (
                icon
              ) : update ? (
                <Edit fontSize="medium" />
              ) : (
                <AddIcon fontSize="medium" />
              )}
            </IconButton>
          )}
        </Tooltip>
      </>
    );
  }
);

export const SearchAction = ({ route, refetch, search, setSearch }) => {
  const { pages } = useUIContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Create New");
  const [config, setConfig] = useState(null);
  const [fields, setFields] = useState(null);
  const [values, setValues] = useState({});

  useEffect(() => {
    const tokens = route.substring(1).split("/");
    var config;
    if (tokens.length > 2) {
      config = pages[tokens[0]].subpages[tokens[2]];
    } else {
      config = pages[tokens[0]];
    }

    setConfig(config);
    setFields(
      config.columns.map((col) => {
        return col.search
          ? {
              ...col.search,
              name: col.accessorKey,
              label: col.header,
              value: search[col.accessorKey],
            }
          : {
              type: "text",
              name: col.accessorKey,
              label: col.header,
              value: search[col.accessorKey],
            };
      })
    );
    setTitle(`Search ${config.title}`);
  }, []);

  const reset = () => {
    setSearch({});
    setValues({});
  };

  const onSubmit = (data, formik, setLoading) => {
    setValues(data);

    data = getFilters(data, fields);
    console.log(data);
    setSearch(data);
    setOpen(false);
    // var values = config.add?.process(data);
    // values = values ? values : data;

    // console.log(values);
    // request({
    //   url: `/api${route}`,
    //   method: "post",
    //   data: values,
    // }).then(() => {
    //   refetch();
    //   setOpen(false);
    // });
  };
  return (
    <>
      {config && fields && (
        <FormDialog
          submitText="Search"
          onSubmit={onSubmit}
          open={open}
          preserve={true}
          setOpen={setOpen}
          title={title}
          collection={config.collection}
          fields={fields}
          values={values}
          // schema={getSchema(collection, field, {})}
        />
      )}

      <Tooltip arrow title="New" key="search">
        <IconButton onClick={() => setOpen(true)}>
          <Badge
            badgeContent={Object.keys(search).length}
            color="primary"
            variant="dot"
          >
            <Search fontSize="medium" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Tooltip arrow title="Clear Search" key="searchoff">
        <IconButton onClick={() => reset()}>
          <SearchOff fontSize="medium" />
        </IconButton>
      </Tooltip>
    </>
  );
};

export const UtilityAction = ({ editorRef, currScript }) => {
  const utilroute = "/util/utilities";
  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      utilroute,
      //   columnFilters, //refetch when columnFilters changes
      //   globalFilter, //refetch when globalFilter changes
      //   pagination.pageIndex, //refetch when pagination.pageIndex changes
      //   pagination.pageSize, //refetch when pagination.pageSize changes
      //   sorting, //refetch when sorting changes
    ],
    queryFn: async () => {
      const fetchURL = new URL(`/api${utilroute}`, document.URL);
      //   fetchURL.searchParams.set(
      //     "start",
      //     `${pagination.pageIndex * pagination.pageSize}`
      //   );

      //   var sort = sorting || [];

      //   sort = sorting.map(({ id, desc }) => ({
      //     property: id,
      //     direction: desc ? "DESC" : "ASC",
      //   }));

      //   fetchURL.searchParams.set("limit", `${pagination.pageSize}`);
      //   fetchURL.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
      //   fetchURL.searchParams.set("globalFilter", globalFilter ?? "");
      //   fetchURL.searchParams.set("sort", JSON.stringify(sort));
      const response = await request({
        url: fetchURL.href,
        method: "get",
      });
      console.log(response);
      return response.data;
    },
    keepPreviousData: true,
  });

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const onClick = (i) => {
    console.log(i);
    console.log(editorRef);
    const [module, cls] = i.path.split(".");
    var func;
    var type;
    if (i.type == "Endpoint") {
      type = "Endpoint";
      func =
        '    def action(self):\n        return Endpoint.send_resp_data("Success", 200)';
    } else {
      type = "Action";
      func = `    def action(self):\n        return Action.send_status("completed")`;
    }

    editorRef.current.setValue(
      `from amps import ${type}\nfrom ${module} import ${cls}\n\nclass ${currScript.name}(${cls}):\n\n${func}`
    );
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <IconButton disabled={!Boolean(currScript)} onClick={handleClick}>
        <Edit />
        {open ? ( // You do the check here
          <Popper
            id={id}
            open={open}
            anchorEl={anchorEl}
            modifiers={[
              {
                name: "flip",
                enabled: true,
                options: {
                  altBoundary: true,
                  rootBoundary: "document",
                  padding: 8,
                },
              },
            ]}
          >
            {!isLoading && <RecursiveMenu items={data} onClick={onClick} />}
          </Popper>
        ) : null}
      </IconButton>
    </ClickAwayListener>
  );
};

export const getFilters = (values, fields) => {
  // var fieldKeys = fields.map((field) => field.field);
  console.log(fields);
  console.log(values);
  var filters = {};

  fields.forEach((field) => {
    if (values[field.name] && values[field.name] != "") {
      if (field.type == "range") {
        var val = values[field.name];
        if (!(!val["$gt"] && !val["$lt"])) {
          filters[field.name] = {};
        }

        if (val["$gt"]) {
          filters[field.name]["$gt"] = { $date: val["$gt"] };
        }
        if (val["$lt"]) {
          filters[field.name]["$lt"] = { $date: val["$lt"] };
        }
      } else if (field.type == "text") {
        filters[field.name] = {
          $regex: values[field.name],
        };
      } else if (field.type == "fileSize") {
        filters[field.name] = values[field.name];
      } else if (field.type == "select" || field.type == "aggregate") {
        filters[field.name] = values[field.name];
      } else {
        filters[field.name] = { $in: values[field.name] };
      }
    }
  });
  return filters;
};
