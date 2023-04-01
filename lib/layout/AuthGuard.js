import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, createSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useUIContext } from "../context/UIContext";

export const AuthGuard = (props) => {
  const { useAuthContext } = useUIContext();
  const { children } = props;
  const { isAuthenticated } = useAuthContext();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Only do authentication check on component mount.
  // This flow allows you to manually redirect the user after sign-out, otherwise this will be
  // triggered and will automatically redirect to sign-in page.

  useEffect(() => {
    // if (!router.isReady) {
    //   return;
    // }

    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (ignore.current) {
      return;
    }

    ignore.current = true;

    if (!isAuthenticated) {
      navigate({
        pathname: "/login",
        search: `?${createSearchParams({ continueUrl: location.pathname })}`,
      });
      //   router
      //     .replace({
      //       pathname: "/sign-in",
      //       query:
      //         router.asPath !== "/" ? { continueUrl: router.asPath } : undefined,
      //     })
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};
