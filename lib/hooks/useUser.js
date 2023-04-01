import { useQuery } from "@tanstack/react-query";
import { request } from "../util/util";

export const useUser = () => {
  const { data: user } = useQuery({
    queryKey: "user",
    queryFn: async () => {
      var resp = await request({
        url: "/api/user/info",
        method: "GET",
      });
      return resp.data;
    },
  });
  return { user };
};
