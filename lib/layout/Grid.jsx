import React, { useEffect, useState, useRef } from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import MaterialReactTable from "material-react-table";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useQuery } from "@tanstack/react-query";
import { request } from "../util/util";

import { useModal } from "../hooks/useModal";
import { useGridActions } from "../util/gridactions";
import { useUIContext } from "../contexts/UIContext";
import { useTokens } from "amps_ui_core";

export const Grid = ({ config: config, route: rte, isSubpage }) => {
  // const { confRowActions = [], confActions = [], ...config } = conf;

  const { modal, Modal } = useModal();
  const [rowSelection, setRowSelection] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const [columnFilters, setColumnFilters] = useState([]);
  const [search, setSearch] = useState(
    config.defaultFilter ? config.defaultFilter() : {}
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState(config.sort || []);
  const [route, setRoute] = useState(null);
  const { main, field } = useTokens(route);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  useEffect(() => {
    if (rte) {
      setRoute(rte);
    } else {
      setRoute(location.pathname);
    }
  });

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      route || location.pathname,
      search,
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
    ],
    queryFn: async () => {
      const fetchURL = new URL(
        `/api${route || location.pathname}`,
        document.URL
      );
      fetchURL.searchParams.set(
        "start",
        `${pagination.pageIndex * pagination.pageSize}`
      );

      var sort = sorting || [];

      sort = sorting.map(({ id, desc }) => ({
        property: id,
        direction: desc ? "DESC" : "ASC",
      }));

      fetchURL.searchParams.set("limit", `${pagination.pageSize}`);
      fetchURL.searchParams.set("filters", JSON.stringify(search ?? {}));
      fetchURL.searchParams.set("globalFilter", globalFilter ?? "");
      fetchURL.searchParams.set("sort", JSON.stringify(sort));

      const response = await request({
        url: fetchURL.href,
        method: "get",
      });
      console.log(response);
      return response.data;
    },
    keepPreviousData: true,
  });

  const { actions, rowActions } = useGridActions({
    rowSelection,
    search,
    setSearch,
    route: route,
    tokens: { main, field },
    config,
    refetch,
    modal,
  });

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    setSorting(config.sort || []);
  }, [config]);

  return (
    <>
      <MaterialReactTable
        initialState={{
          density: "compact",
          columnPinning: {
            right: ["mrt-row-actions"],
            left: ["mrt-row-select"],
          },
        }}
        enableMultiRowSelection={true}
        enableRowSelection={true}
        onRowSelectionChange={setRowSelection}
        columns={config.columns}
        data={isSubpage ? data ?? [] : data?.rows ?? []} //data is undefined on first render
        manualFiltering
        getRowId={(d) => d._id}
        manualPagination={!isSubpage}
        manualSorting
        enableClickToCopy={true}
        muiTableBodyRowProps={({ row }) => ({
          onDoubleClick: (event) => {
            // modal.current.configure({ title: "HELLO" });
            // modal.current.open();
            console.info(row);
            if (config.dblClick) {
              config.dblClick({
                data: row.original,
                modal: modal.current,
                navigate,
              });
            } else {
              navigate([route, row.original._id].join("/"), {
                replace: false,
              });
            }
          },
          sx: {
            cursor: "pointer", //you might want to change the cursor too when adding an onClick
          },
        })}
        muiTableContainerProps={{
          // ref: tableContainerRef, //get access to the table container element
          sx: { height: "calc(100% - 7rem)" }, //give the table a max height
        }}
        muiTablePaperProps={{
          // ref: tableContainerRef, //get access to the table container element
          sx: { height: "100%" }, //give the table a max height
        }}
        muiToolbarAlertBannerProps={
          isError
            ? {
                color: "error",
                children: "Error loading data",
              }
            : undefined
        }
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        renderTopToolbarCustomActions={() => (
          <Box key="custom">
            <Tooltip arrow title="Refresh Data" key="refresh">
              <IconButton onClick={() => refetch()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {config.actions?.map((action) => {
              return actions[action]();
            })}
          </Box>
        )}
        enableColumnResizing
        enableRowActions={config.rowActions?.length}
        positionActionsColumn="last"
        displayColumnDefOptions={{
          "mrt-row-actions": {
            size:
              config.rowActions?.length == 1
                ? 60
                : config.rowActions?.length * 45 ?? 30,
            enablePinning: true,
          },
        }}
        renderRowActions={
          // config.rowActions?.length > 3
          //   ? null
          //   :
          ({ row }) => (
            <Box sx={{ display: "flex", p: 0 }}>
              {config.rowActions?.map((Action) =>
                typeof Action === "string" ? (
                  rowActions[Action]({ row: row })
                ) : (
                  <Action row={row} />
                )
              )}
            </Box>
          )
          // ?? null
        }
        // renderRowActionMenuItems={
        //   config.rowActions?.length > 3
        //     ? ({ row }) =>
        //         config.rowActions?.map((action) => (
        //           <MenuItem>{rowActions[action]({ row: row })}</MenuItem>
        //         ))
        //     : null ?? null
        // }
        rowCount={data?.count ?? 0}
        state={{
          columnFilters,
          globalFilter,
          isFetching,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isFetching,
          sorting,
          rowSelection,
        }}
      />
      <Modal ref={modal} />
    </>
  );
};
