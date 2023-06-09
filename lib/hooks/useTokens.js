import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useTokens = (route) => {
  const [main, setMain] = useState();
  const [id, setId] = useState();
  const [field, setField] = useState();
  const [fieldid, setFieldId] = useState();
  const location = useLocation();

  useEffect(() => {
    var r = route ? route : location.pathname;
    var tokens = r.substring(1).split("/");
    var mp = [setMain, setId, setField, setFieldId];
    for (let i = 0; i < tokens.length; i++) {
      mp[i](tokens[i]);
    }
  }, [location.pathname]);

  return { main, id, field, fieldid };
};
