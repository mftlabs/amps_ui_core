import React, { useEffect, useRef, useState } from "react";

import { Box, Typography } from "@mui/material";

import moment from "moment-timezone";

export const Clock = ({ timezone }) => {
  const [dt, setDt] = useState(
    new Date().toLocaleString("en-US", { timeZone: timezone })
  );

  useEffect(() => {
    let secTimer = setInterval(() => {
      setDt(new Date().toLocaleTimeString("en-US", { timeZone: timezone }));
    }, 1000);

    return () => clearInterval(secTimer);
  }, []);

  return (
    <>
      <Typography noWrap={true} color="neutral.500">
        <Box
          component="span"
          sx={{
            display: {
              xs: "none",
              lg: "unset",
            },
          }}
        ></Box>
        {dt} {moment().tz(timezone).zoneAbbr()}
      </Typography>
    </>
  );
};
