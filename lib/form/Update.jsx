import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import KeyIcon from "@mui/icons-material/Key";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { Loader } from "../util/components/Loader";

import { useFormik } from "formik";
import * as yup from "yup";
import { renderFields, loadValues } from "./util";
import { useQuery } from "@tanstack/react-query";
import { request } from "../util/util";
import { useCurrent } from "../hooks/useCurrent";
import { useUIContext } from "../contexts/UIContext";
export const UpdateForm = ({
  fields,
  schema: root,
  onSubmit,
  values = {},
  overwrite,
  entityId,
  refetch,
  field,
  collection,
  reloadParent = () => {},
  route,
  stat = {},
}) => {
  const { useSchemas, types, useAuthContext, disabled } = useUIContext();
  const { user } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [typefields, setTypeFields] = useState([]);
  const [schema, setSchema] = useState(root);
  const { current } = useCurrent({
    route: `/${collection}/${entityId}`,
    enabled: Boolean(entityId),
  });

  const submit = async (values) => {
    var values = onSubmit(values);
    request({
      url: "/api/" + route,
      method: overwrite ? "POST" : "PUT",
      timeout: 60000,
      params: {},
      data: values,
    }).then(() => {
      refetch();
      reloadParent();
      setEditing(false);
      formik.handleReset();
    });
  };

  useEffect(() => {
    formik.setValues(values);
  }, [values]);

  const formik = useFormik({
    initialValues: values,
    validationSchema: schema,
    onSubmit: submit,
    enableReinitialize: true,
    isInitialValid: false,
  });
  const { getSchema } = useSchemas();

  useEffect(() => {
    if (formik.values.type) {
      var type = field
        ? types[collection].subpages?.[field]?.[formik.values.type]
        : types[collection][formik.values.type];
      var s = getSchema(collection, field, formik.values);
      setSchema(s);
      if (type) {
        var inits = loadValues({}, type.fields);

        var baseVals = loadValues({}, fields, formik.values);
        baseVals["_id"] = values["_id"];

        if (current) {
          baseVals["_entity"] = current;
        }
        if (user) {
          baseVals["_user"] = user;
        }

        var newVals = { ...baseVals, ...inits };
        formik.setValues(values);

        setTypeFields(type.fields);
      } else {
        setTypeFields([]);
      }
    } else {
      setTypeFields([]);
    }
  }, [formik.values.type]);

  useEffect(() => {
    if (current) {
      formik.setFieldValue("_entity", current);
    }
  }, [current]);

  useEffect(() => {
    if (user) {
      formik.setFieldValue("_user", user);
    }
  }, [user]);

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        // p: 2,
        display: "flex",
        flexDirection: "column",

        width: "100%",
        height: "100%",
      }}
    >
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {renderFields(formik, fields, !editing, false, stat)}
        {renderFields(formik, typefields, !editing, false, stat)}
      </Box>
      <Box>
        {editing ? (
          <>
            <Button
              type="submit"
              disabled={!formik.isValid}
              variant="contained"
            >
              Save
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                formik.setValues(values);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            disabled={disabled(route)}
            onClick={(e) => {
              e.preventDefault();
              setEditing(true);
            }}
            variant="contained"
          >
            Edit
          </Button>
        )}
      </Box>
    </Box>
  );
};

export const Update = ({
  location,
  route,
  stat,
  field,
  // refetch,
  reloadParent = () => {},
}) => {
  const { useSchemas, formfields, pages } = useUIContext();
  const [config, setConfig] = useState(null);
  const [fields, setFields] = useState(null);
  const [collection, setCollection] = useState(null);
  const [entityId, setEntityId] = useState(null);

  const { getSchema } = useSchemas();

  route = route ? route : location.pathname;

  useEffect(() => {
    var tokens = route.substring(1).split("/");
    setCollection(tokens[0]);
    var config;
    if (tokens.length > 2) {
      config = pages[tokens[0]].subpages[tokens[2]];
      setEntityId(tokens[1]);
    } else {
      config = pages[tokens[0]];
    }
    setConfig(config);
    setFields(
      tokens.length > 2
        ? formfields[tokens[0]].subpages[tokens[2]]
        : formfields[tokens[0]].root
    );
  }, [route]);

  const onSubmit = (vals) => {
    delete vals._user;
    if (entityId) {
      delete vals._entity;
    }
    var values = config.update?.process(vals);
    return values ? values : vals;
  };

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [route],
    queryFn: async () => {
      const fetchURL = new URL(`/api/${route}`, document.URL);

      const response = await request({
        url: fetchURL.href,
        method: "get",
      });
      return response.data;
    },
  });

  // useEffect(() => {
  //   refetch();
  // }, [route]);

  return isLoading ? (
    <Loader />
  ) : config && data ? (
    <UpdateForm
      onSubmit={onSubmit}
      values={config.load ? config.load(data) : data}
      refetch={refetch}
      reloadParent={reloadParent}
      //   title={title}
      entityId={entityId}
      field={field}
      stat={stat}
      route={route}
      collection={collection}
      overwrite={config.overwrite}
      fields={fields}
      schema={getSchema(collection, field, {})}
    />
  ) : (
    <Loader />
  );
};
