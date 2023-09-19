import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { request } from "../util/util";
import { useQuery } from "@tanstack/react-query";

export const useCurrent = ({ route: rte, enabled = true } = {}) => {
  const location = useLocation();

  const {
    data: current,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [rte ? rte : location.pathname],
    enabled: enabled,
    queryFn: async () => {
      const fetchURL = new URL(
        `/api/${rte ? rte : location.pathname}`,
        document.URL
      );

      const response = await request({
        url: fetchURL.href,
        method: "get",
      });
      return response.data;
    },
  });

  return { current };
};
