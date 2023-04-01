import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { request } from "../util/util";

export const useCurrent = ({ route: rte, enabled = true } = {}) => {
  const [current, setCurrent] = useState();
  const [route, setRoute] = useState();
  const location = useLocation();
  useEffect(() => {
    if (location) {
      setRoute(rte ? rte : location.pathname);
    }
  }, [rte, location]);

  useEffect(() => {
    if (enabled && route) {
      var fetch = async () => {
        var tokens = route.substring(1).split("/");
        console.log(tokens);
        if (tokens.length > 1 || tokens.length < 4) {
          var resp = await request({
            url: `/api/${tokens[0]}/${tokens[1]}`,
          });
          setCurrent(resp.data);
        } else if (tokens.length == 4) {
          var resp = await request({
            url: `/api/${tokens.join("/")}`,
          });
          setCurrent(resp.data);
        }
      };
      fetch();
    }
  }, [route, enabled]);

  return { current };
};
