import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import PropTypes from "prop-types";
// import { request, useRenew } from "../util/util";
// import { Socket } from "phoenix";
// import { useQueryClient } from "@tanstack/react-query";

// const HANDLERS = {
//   INITIALIZE: "INITIALIZE",
//   SIGN_IN: "SIGN_IN",
//   SIGN_OUT: "SIGN_OUT",
//   UPDATE_ENV: "UPDATE_ENV",
// };

// const initialState = {
//   isAuthenticated: false,
//   isLoading: true,
//   user: null,
// };

// const handlers = {
//   [HANDLERS.INITIALIZE]: (state, action) => {
//     const user = action.payload;

//     return {
//       ...state,
//       ...// if payload (user) is provided, then is authenticated
//       (user
//         ? {
//             isAuthenticated: true,
//             isLoading: false,
//             user,
//           }
//         : {
//             isLoading: false,
//           }),
//     };
//   },
//   [HANDLERS.SIGN_IN]: (state, action) => {
//     if (state.user && state.user.socket) {
//       state.user.socket.disconnect();
//     }
//     const user = action.payload;

//     return {
//       ...state,
//       isAuthenticated: true,
//       user,
//     };
//   },
//   [HANDLERS.SIGN_OUT]: (state) => {
//     localStorage.clear();
//     return {
//       ...state,
//       isAuthenticated: false,
//       user: null,
//     };
//   },
//   [HANDLERS.UPDATE_ENV]: (state, action) => {
//     const env = action.payload;

//     return {
//       ...state,
//       user: {
//         ...state.user,
//         env: env,
//       },
//     };
//   },
// };

// const reducer = (state, action) =>
//   handlers[action.type] ? handlers[action.type](state, action) : state;

// The role of this context is to propagate authentication state through the App tree.

export const UIContext = createContext({ formfields, useSchemas, pages });

export const UIProvider = ({ formfields, pages, useSchemas }) => {
  return (
    <UIContext.Provider
      value={{
        formfields,
        pages,
        useSchemas,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const UIConsumer = UIContext.Consumer;

export const useUIContext = () => useContext(UIContext);
