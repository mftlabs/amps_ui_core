import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  Box,
  MenuItem,
  MenuList,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Form } from "../form/Form";
import * as yup from "yup";
import { request } from "../util/util";
import { toast } from "react-toastify";
import { useUIContext } from "../context/UIContext";
import { useModal } from "../hooks/useModal";

export const AccountPopover = (props) => {
  const { anchorEl, onClose, open, ...other } = props;
  const { useAuthContext } = useUIContext();
  const { signOut, user } = useAuthContext();
  const { Modal, modal } = useModal();
  // const { user } = useUser();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    onClose?.();
    signOut();
    navigate("/login");

    //     // Check if authentication with Zalter is enabled
    //     // If not enabled, then redirect is not required
    //     if (!ENABLE_AUTH) {
    //       return;
    //     }
    //     // Check if auth has been skipped
    //     // From sign-in page we may have set "skip-auth" to "true"
    //     // If this has been skipped, then redirect to "sign-in" directly
    //     const authSkipped =
    //       globalThis.sessionStorage.getItem("skip-auth") === "true";
    //     if (authSkipped) {
    //       // Cleanup the skip auth state
    //       globalThis.sessionStorage.removeItem("skip-auth");
    //       // Redirect to sign-in page
    //       Router.push("/sign-in").catch(console.error);
    //       return;
    //     }
    //     try {
    //       // This can be call inside AuthProvider component, but we do it here for simplicity
    //       await auth.signOut();
    //       // Update Auth Context state
    //       authContext.signOut();
    //       // Redirect to sign-in page
    //       Router.push("/sign-in").catch(console.error);
    //     } catch (err) {
    //       console.error(err);
    //     }
  };

  return (
    <>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: "left",
          vertical: "bottom",
        }}
        onClose={onClose}
        open={open}
        PaperProps={{
          sx: { width: "300px" },
        }}
        {...other}
      >
        <Box
          sx={{
            py: 1.5,
            px: 2,
          }}
        >
          <Typography variant="overline">Account</Typography>
          <Typography color="text.secondary" variant="body2">
            {user &&
              `${user.user.firstname} ${user.user.lastname} (${user.user.username})`}
          </Typography>
          {/* <Typography variant="overline">Environment</Typography>
          <Typography color="text.secondary" variant="body2">
            {user && user.env == "" ? "Default" : user.env}
          </Typography> */}
          {/* <Typography color="text.secondary" variant="body2">
          {environments ? (
            <Autocomplete
              getOptionLabel={(option) => {
                if (typeof option === "object" && option !== null) {
                  return option["desc"];
                }
              }}
              isOptionEqualToValue={(option, val) => {
                if (typeof val === "object" && val !== null) {
                  return option["name"] == val["name"];
                } else {
                  return option["name"] == val;
                }
              }}
              size="small"
              sx={{ flex: 1, fontSize: 10 }}
              options={environments}
              value={environment}
              onChange={(e, value) => {
                updateEnv(value.name);
                onClose();
              }}
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  fullWidth={true}
                  sx={{ flex: 1, fontSize: 10 }}
                  {...params}
                  // label="Environment"
                  // label={label}
                />
              )}
            />
          ) : (
            <Loader />
          )}
        </Typography> */}
        </Box>
        <MenuList
          disablePadding
          sx={{
            "& > *": {
              "&:first-of-type": {
                borderTopColor: "divider",
                borderTopStyle: "solid",
                borderTopWidth: "1px",
              },
              padding: "12px 16px",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              modal.current.configure({
                title: "Update Password",
                content: (
                  <Form
                    schema={{
                      password: yup.string().password().required(),
                      confirmPassword: yup
                        .string()
                        .test(
                          "passwords-match",
                          "Passwords must match",
                          function (value, context) {
                            return this.parent.password === value;
                          }
                        ),
                    }}
                    submitText="Update"
                    fields={[
                      {
                        type: "text",
                        name: "password",
                        variant: "outlined",
                        inputType: "password",
                        label: "Password",
                      },
                      {
                        type: "text",
                        name: "confirmPassword",
                        variant: "outlined",
                        inputType: "password",
                        label: "Confirm Password",
                      },
                    ]}
                    onSubmit={(values) => {
                      request({
                        url: "/api/admin/changepassword/" + user.user._id,
                        method: "post",
                        data: {
                          password: values.password,
                          // oldpassword: oldpassword,
                        },
                      })
                        .then(() => {
                          toast.success("Password Updated");
                          modal.current.close();
                        })
                        .catch(() => {
                          toast.error("Error Updating Password");
                        });
                    }}
                  />
                ),
              });
              modal.current.open();
            }}
          >
            Update Password
          </MenuItem>
          <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
        </MenuList>
      </Popover>
      <Modal ref={modal} />
    </>
  );
};

AccountPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
};
