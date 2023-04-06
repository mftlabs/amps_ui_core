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
  stat,
  values,
  submitText = "Create",
  formikRef,
  width,
  height,
}) => {
  const { useSchemas, types } = useUIContext();
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
    if (values) {
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

  useEffect(() => {
    console.log(formik.values);
  }, [formik.values]);

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        margin: 0,
        width: "100%",
        height: 500,
        flex: 1,
        // height: "80vh",
      }}
    >
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {loading || !initialized ? (
          <Loader />
        ) : (
          <>
            {renderFields(formik, fields, false, false, stat)}
            {renderFields(formik, typefields, false, false, stat)}
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", py: 2 }}>
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
