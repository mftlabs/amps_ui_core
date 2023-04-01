import React, { useEffect, useState } from "react";
import { mapping, queryFn } from "../util/util";
import { useQuery } from "@tanstack/react-query";

export const useMetadata = () => {
  const [data, setData] = useState();
  const { data: fields, ...others } = useQuery({
    queryKey: ["/fields"],
    queryFn: () => {
      return queryFn("/fields", {});
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (fields) {
      var d = fields.concat(
        Object.entries(mapping).map((m) => {
          return { field: m[0], desc: m[1].label };
        })
      );
      setData(d);
    }
  }, [fields]);
  return { data, ...others };
};
