import React, { useEffect, useState, useRef, isValidElement } from "react";
import { Box, Tooltip, IconButton, Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import MaterialReactTable from "material-react-table";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useQuery } from "@tanstack/react-query";
import { request } from "../util/util";

import { useModal } from "../hooks/useModal";
import { useGridActions } from "../util/gridactions";
import { useUIContext } from "../contexts/UIContext";
import { useTokens } from "amps_ui_core";
import { useCurrent } from "../hooks/useCurrent";

export const Grid = ({ config: config, route: rte, isSubpage }) => {
  // const { confRowActions = [], confActions = [], ...config } = conf;
  const { modal, Modal } = useModal();
  const [rowSelection, setRowSelection] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const [columnFilters, setColumnFilters] = useState([]);
  const [staticSearch, setStaticSearch] = useState(
    config.staticSearch
      ? config.staticSearch instanceof Function
        ? undefined
        : config.staticSearch
      : undefined
  );
  const [search, setSearch] = useState(
    config.defaultFilter ? config.defaultFilter() : {}
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState(config.sort || []);
  const [route, setRoute] = useState(null);
  const { main, id, field } = useTokens(route);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const [itemRoute, setItemRoute] = useState();

  const { current } = useCurrent({
    route: itemRoute,
    enabled: Boolean(itemRoute),
  });

  const enabled = () => {
    return Boolean(isSubpage && rte ? staticSearch && route : route);
  };

  useEffect(() => {
    if (rte) {
      setRoute(rte);
    } else {
      setRoute(location.pathname);
    }
  }, [location.pathname, rte]);

  useEffect(() => {
    if (id && isSubpage) {
      if (isSubpage && rte) {
        setItemRoute(`/${main}/${id}`);
      }
    }
  }, [id]);

  useEffect(() => {
    if (current && isSubpage && rte) {
      if (config.staticSearch) {
        var ss = config.staticSearch(current);
        setStaticSearch(ss);
      } else {
        setStaticSearch({});
      }
    }
  }, [current]);

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      route,
      search,
      columnFilters, //refetch when columnFilters changes
      globalFilter, //refetch when globalFilter changes
      pagination.pageIndex, //refetch when pagination.pageIndex changes
      pagination.pageSize, //refetch when pagination.pageSize changes
      sorting, //refetch when sorting changes
      staticSearch,
    ],

    enabled: enabled(),
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
      fetchURL.searchParams.set(
        "filters",
        JSON.stringify({ ...search, ...(staticSearch ?? {}) } ?? {})
      );
      fetchURL.searchParams.set("globalFilter", globalFilter ?? "");
      fetchURL.searchParams.set("sort", JSON.stringify(sort));

      const response = await request({
        url: fetchURL.href,
        method: "get",
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  const { actions, rowActions } = useGridActions({
    rowSelection,
    search,
    setSearch,
    setStaticSearch,
    route: route,
    tokens: { main, field },
    config,
    refetch,
    modal,
  });

  useEffect(() => {
    setSorting(config.sort || []);
  }, [config]);

  useEffect(() => {
    if (enabled()) {
      if (!isSubpage) {
        refetch();
      }
    }
  }, [route]);

  return (
    <>
      <MaterialReactTable
        initialState={{
          isLoading: true,
          density: "compact",
          columnPinning: {
            right: ["mrt-row-actions"],
            left: ["mrt-row-select"],
          },
        }}
        enableExpanding={config.subRows}
        // getSubRows={config.getSubRows}
        enableMultiRowSelection={true}
        enableRowSelection={true}
        onRowSelectionChange={setRowSelection}
        columns={config.columns}
        data={
          rte ? data?.rows ?? [] : isSubpage ? data ?? [] : data?.rows ?? []
        } //data is undefined on first render
        manualFiltering
        getRowId={(d) => d._id}
        manualPagination={isSubpage ? (rte ? true : false) : true}
        manualSorting
        enableClickToCopy={true}
        enableStickyHeader={true}
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

            {config.actions?.map((Action) => {
              if (typeof Action == "function") {
                return current ? (
                  <Action current={current} refetch={refetch} />
                ) : null;
              } else {
                return actions[Action]();
              }
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
