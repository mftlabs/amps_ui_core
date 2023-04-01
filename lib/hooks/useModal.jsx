import { Modal } from "../layout/Modal";
import React, { useRef } from "react";

export const useModal = (props) => {
  const modal = useRef();

  return { Modal, modal };
};
