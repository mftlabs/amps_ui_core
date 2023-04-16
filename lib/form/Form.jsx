import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useFormik, useFormikContext } from "formik";
import { Loader } from "../util/components/Loader";
import { renderFields, loadValues } from "./util";
import { useCurrent } from "../hooks/useCurrent";
import { useUIContext } from "../contexts/UIContext";

export const Form = ({
  fields,
  schema: root,
  onSubmit,
  collection,
  entityId,
  field,
  preserve,
  stat = {},
  values,
  submitText = "Create",
  formikRef,
  width,
  height,
}) => {
  const { useSchemas, types, useAuthContext } = useUIContext();
  const { user } = useAuthContext();
  const [initValues, setInitValues] = useState({});
  const [typefields, setTypeFields] = useState([]);
  const [schema, setSchema] = useState(root);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(
    values ? (values.type ? false : true) : true
  );
  const [currType, setType] = useState(null);
  const { current } = useCurrent({
    route: `/${collection}/${entityId}`,
    enabled: Boolean(entityId),
  });
  const { getSchema } = useSchemas();
  const submit = async (values) => {
    delete values._user;
    delete values._entity;

    setLoading(true);
    await onSubmit(values, formik, setLoading);
    setLoading(false);
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: schema,
    onSubmit: submit,
    enableReinitialize: true,
    isInitialValid: false,
    validateOnMount: true,
  });

  useEffect(() => {
    if (Object.keys(stat).length) {
      if (values) {
        setInitValues(Object.assign(stat, values));
      } else {
        setInitValues(stat);
      }
    } else if (values) {
      console.log(values);
      setInitValues(values);
    } else {
      var d = {};
      d = loadValues(d, fields);
      setInitValues(d);
    }
  }, []);

  useEffect(() => {
    if (current) {
      formik.setFieldValue("_entity", current);
    }
  }, [current]);

  useEffect(() => {
    return () => {
      // if (!preserve) {
      console.log("resetting");
      formik.handleReset();
      // }
    };
  }, []);

  useEffect(() => {
    if (user) {
      formik.setFieldValue("_user", user);
    }
  }, [user]);

  // useEffect(() => {
  //   console.log(formik.errors);
  // }, [formik.errors]);

  useEffect(() => {
    if (formik.values.type) {
      var type = field
        ? types[collection].subpages?.[field]?.[formik.values.type]
        : types[collection][formik.values.type];
      var s = getSchema(collection, field, formik.values);
      setSchema(s);
      if (type) {
        var inits = loadValues(
          {},
          type.fields,
          formik.values.type == currType
            ? formik.values
            : initialized
            ? {}
            : formik.values
        );
        var baseVals = loadValues({}, fields, formik.values);
        if (current) {
          baseVals["_entity"] = current;
        }

        if (user) {
          baseVals["_user"] = user;
        }
        var values = { ...baseVals, ...inits };
        formik.setValues(values);
        setTypeFields(type.fields);
        setInitialized(true);
        setType(formik.values.type);
      } else {
        setTypeFields([]);
      }
    } else {
      setTypeFields([]);
    }
  }, [formik.values.type]);

  // useEffect(() => {
  //   console.log(formik.values);
  // }, [formik.values]);

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 128px)",
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "scroll", paddingBottom: "64px" }}>
        {loading || !initialized ? (
          <Loader />
        ) : (
          <>
            {renderFields(formik, fields, false, false, stat)}
            {renderFields(formik, typefields, false, false, stat)}
          </>
        )}
      </Box>

      <Box
        zIndex={100}
        sx={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          backgroundColor: "rgba(255, 255, 255, .7)",
          justifyContent: "flex-end",
          p: 2,
        }}
      >
        <Button
          variant="contained"
          disabled={loading || !formik.isValid}
          type="submit"
        >
          {submitText}
        </Button>
      </Box>
    </Box>
  );
};
