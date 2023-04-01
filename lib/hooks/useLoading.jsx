import React, { useEffect, useRef, useState } from "react";
export function useLoading(def = false) {
  const [loading, setLoading] = useState(def);

  function parent() {
    return {
      className: "relative",
    };
  }

  function Loader() {
    return (
      <div
        className={`absolute flex w-full h-full items-center overflow-hidden ${
          loading ? "" : "hidden"
        }`}
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          zIndex: 2 /* Specify a stack order in case you're using a different order for other elements */,
          cursor: "pointer",
          top: 0,
          left: 0,
        }}
      >
        <Loader></Loader>
      </div>
    );
  }

  return { Loader, setLoading, loading, parent };
}
