import React from "react";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import {
  request,
  queryFn,
  FormAction,
  SearchAction,
  useUIContext,
} from "amps_ui_core";

import { toast } from "react-toastify";
import { useQueryFn } from "./util";
import { useConfirm } from "material-ui-confirm";

export const useGridActions = (props) => {
  const { rowSelection, search, setSearch, route, config, refetch, tokens } =
    props;
  const { useGridActions, checkPerm } = useUIContext();
  const confirm = useConfirm();

  const { actions: a, rowActions: r } = useGridActions({ ...props });

  const rowActions = {
    ...r,
    active: ({ row }) => {
      return (
        <IconButton
          sx={{ color: row.original.active ? "green" : "red" }}
          disabled={!checkPerm(tokens, "actions.active")}
          key={`${route}-active`}
          onClick={async () => {
            console.log(row.original);
            var tokens = location.pathname.substring(1).split("/");
            request({
              url: "/api/" + route + "/" + row.original._id,
              method: "PUT",
              timeout: 60000,
              params: {},
              data: { active: !row.original.active },
            })
              .then(() => {
                toast.success(
                  `Toggled ${!row.original.active ? "Active" : "Inactive"}`
                );
                refetch();
              })
              .catch(() => {
                toast.error(`Failed to toggle active status`);
              });
            // var title = "Delete Record";
            // var msg = "Are you sure you want to delete?";
          }}
        >
          {row.original.active ? (
            <ToggleOffIcon fontsize="small" />
          ) : (
            <ToggleOnIcon fontsize="small" />
          )}
        </IconButton>
      );
    },
    delete: ({ row }) => {
      const queryFn = useQueryFn();
      return (
        <IconButton
          disabled={!checkPerm(tokens, "delete")}
          key={`${route}-delete`}
          onClick={async () => {
            var deletable = true;

            var tokens = location.pathname.substring(1).split("/");
            confirm({
              description: "Are you sure you want to delete this item?",
            })
              .then(async () => {
                var msg = "";
                // if (tokens[0] == "services") {
                //   var response = await request({
                //     url: "/api/service/" + row.original.name,
                //     method: "get",
                //     timeout: 60000,
                //   });
                //   var active = response.data;
                //   console.log(active);
                //   if (active) {
                //     confirm({
                //       message:
                //         "This service is currently running, are you sure you want to delete it?",
                //     });
                //   }
                // } else
                if (tokens[0] == "actions") {
                  var rows = await queryFn("/services", {
                    handler: row.original._id,
                  });
                  console.log(rows);
                  if (rows.length) {
                    deletable = false;
                    toast.error(
                      "This action can't be deleted, it is in use by one or more subscribers."
                    );
                  }
                }
                if (deletable) {
                  var id = row.original._id;

                  request({
                    url:
                      tokens.length == 1
                        ? "/api" + location.pathname + "/" + id
                        : "/api" + location.pathname + "/" + id,
                    method: "DELETE",
                    timeout: 60000,
                    params: {},
                    data: tokens.length > 1 ? row.original : {},
                  })
                    .then(async function (response) {
                      // var data = Ext.decode(response.responseText);
                      // mask.hide();
                      // amfutil.broadcastEvent("update", {
                      //   page: tokens[0],
                      // });
                      // Ext.toast({
                      //   title: "Delete",
                      //   html: "<center>Deleted Record</center>",
                      //   autoCloseDelay: 5000,
                      // });
                      // console.log(route);
                      // if (route == "environments") {
                      //   await amfutil.updateEnv();
                      // }
                      if (tokens.length > 1) {
                        // console.log(tokens[2]);
                        // console.log(data);
                        // var rows = data[tokens[2]].map((item) =>
                        //   Object.assign(item, item.parms)
                        // );
                        refetch();
                      } else {
                        refetch();
                      }
                    })
                    .catch(function (e) {
                      console.log(e);
                      // amfutil.onFailure("Failed to Delete", response);
                      refetch();
                    });
                } else {
                  // return Ext.MessageBox.show({
                  //   title: title,
                  //   msg: msg,
                  // });
                }
              })
              .catch((e) => {
                console.log(e);
                console.log("NOPE");
                /* ... */
              });
            console.log(row.original);

            // var title = "Delete Record";
            // var msg = "Are you sure you want to delete?";
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      );
    },
  };

  const actions = {
    ...a,
    search: () => (
      <SearchAction
        key={`${route}-search`}
        refetch={refetch}
        route={location.pathname}
        search={search}
        setSearch={setSearch}
      />
    ),

    add: () => {
      return (
        <FormAction
          key={`${route}-add`}
          disabled={!checkPerm(tokens, "write")}
          refetch={refetch}
          route={location.pathname}
          style={config.dialog}
        />
      );
    },
  };
  return { actions, rowActions };
};
