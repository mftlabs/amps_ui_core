import React, { useState, useEffect } from "react";
import axios from "axios";
import useLoading from "./useLoading";

export const useAxios = (params, { onSuccess, onError } = {}) => {
  const { setLoading, Loader, loading } = useLoading();
  const [response, setResponse] = useState(null);
  const [header, setHeader] = useState(null);
  const [error, setError] = useState(null);
  const [renewed, setRenewed] = useState(false);

  const refresh = async () => {
    await fetchData(params);
  };

  const signout = (resp) => {
    const doSignOut = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("renewal_token");
      location.reload();
    };
    console.log(resp.status == 401);
    if (resp.status == 401) {
      doSignOut();
    } else {
      if (onError) {
        onError(resp);
      } else {
        doSignOut();
      }
    }
  };
  const signin = (data) => {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("renewal_token", data.renewal_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const success = (resp) => {
    if (onSuccess) {
      onSuccess(resp);
    }
  };

  const fetchData = async (params, header = null) => {
    setLoading(true);
    try {
      var config = {
        ...params,
        headers: {
          ...params.headers,
          Authorization: header || localStorage.getItem("access_token"),
        },
      };
      const res = await axios.request(config);
      setResponse(res.data);
      setError(null);
      setRenewed(false);
      success(res);
    } catch (err) {
      var resp = err.response;
      console.log(err);

      if (renewed) {
        signout(resp);
      } else {
        if (resp.status == 401) {
          console.log("Renewing");
          axios
            .post(
              "/api/session/renew",
              {},
              {
                headers: {
                  Authorization: localStorage.getItem("renewal_token"),
                },
              }
            )
            .then(({ data }) => {
              data = data.data;
              signin(data);
              console.log(data.access_token);
              setRenewed(true);
              fetchData(params, data.access_token);
            })
            .catch((e) => {
              console.log(e);
              signout(resp);
            });
        } else {
          signout(resp);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(params);
  }, []);

  return { response, error, loading, Loader, setLoading, refresh };
};
