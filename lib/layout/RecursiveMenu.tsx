import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import MenuList from "@mui/material//MenuList";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";

import Popper, { PopperProps } from "@mui/material/Popper";
import React, { useRef, useState } from "react";
import Edit from "@mui/icons-material/Edit";
import ClickAwayListener from "@mui/base/ClickAwayListener";

type RecursiveMenuItemProps = MenuItemProps & {
  button?: true;
  label: string;
} & Pick<PopperProps, "placement">;
const RecursiveMenuItem = (props: RecursiveMenuItemProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement | null>(null);

  return (
    <MenuItem
      {...props}
      ref={ref}
      sx={{ backgroundColor: open ? "neutral.100" : "white" }}
      onMouseEnter={() => setOpen(true)}
      // onFocus={() => setOpen(true)}
      // onBlur={() => setOpen(false)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={{ fontSize: 14 }}>{props.label}</span>
      <Popper
        anchorEl={ref.current}
        open={open}
        placement={props.placement ?? "right"}
        modifiers={[
          {
            name: "flip",
            enabled: true,
            options: {
              altBoundary: true,
              rootBoundary: "document",
              padding: 8,
            },
          },
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: true,
              rootBoundary: "document",
              padding: 8,
            },
          },
        ]}
      >
        {props.children}
      </Popper>
    </MenuItem>
  );
};

export const RecursiveMenu = ({ elevation = 4, items, onClick = (i) => i }) => {
  return (
    <Paper sx={{ display: "flex" }} elevation={elevation}>
      <MenuList /*autoFocus={true}*/>
        {items.map((item) => {
          const { key, items } = item;
          if (items) {
            return (
              <RecursiveMenuItem autoFocus={false} label={key}>
                <RecursiveMenu
                  elevation={elevation + 1}
                  items={items}
                  onClick={onClick}
                />
              </RecursiveMenuItem>
            );
          } else {
            return (
              <MenuItem
                sx={{ fontSize: 14 }}
                onClick={() => {
                  onClick(item);
                }}
              >
                {key}
              </MenuItem>
            );
          }
        })}
      </MenuList>
    </Paper>
  );
};
