import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useId,
  useState,
} from "react";
import PropTypes from "prop-types";
import { request, useRenew } from "amps_ui_core";
import { Socket } from "phoenix";
import { toast } from "react-toastify";
import { useUIContext } from "./UIContext";
// import "../workers/file.js";

const HANDLERS = {
  ADD_UPLOAD: "ADD_UPLOAD",
  UPLOAD_PROGRESS: "UPLOAD_PROGRESS",
  FINISH_UPLOAD: "FINISH_UPLOAD",
};

const initialState = {
  uploads: [],
};

const handlers = {
  [HANDLERS.ADD_UPLOAD]: (state, action) => {
    const upload = action.payload;

    return {
      ...state,
      uploads: [...state.uploads, upload],
    };
  },

  [HANDLERS.UPLOAD_PROGRESS]: (state, action) => {
    let { id, progress } = action.payload;
    console.log(progress);
    var idx = state.uploads.findIndex((item) => item.id == id);
    var upload = state.uploads[idx];
    if (progress > 0.99) {
      progress = 0.99;
    }
    upload.progress = progress;
    state.uploads[idx] = upload;

    console.log(state.uploads[idx]);
    return { ...state, uploads: state.uploads };
  },
  [HANDLERS.FINISH_UPLOAD]: (state, action) => {
    var idx = state.uploads.findIndex((item) => item.id == action.payload);
    var uploads = state.uploads;
    uploads[idx].progress = 1;

    uploads[idx].status = "Uploaded";

    return {
      ...state,
      uploads: uploads,
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

// The role of this context is to propagate authentication state through the App tree.

export const FileContext = createContext({ undefined });

export const FileProvider = (props) => {
  const { children } = props;
  const { useAuthContext } = useUIContext();
  // const [state, dispatch] = useReducer(reducer, initialState);
  const [uploads, setUploads] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [pending, setPending] = useState(0);
  const [dPending, setDPending] = useState(0);
  const [dChecked, setDChecked] = useState(0);

  const [downloadAdded, setDownloadAdded] = useState(false);

  useEffect(() => {
    setPending(hasPending());
  }, [uploads]);

  useEffect(() => {
    if (downloadAdded) {
      setTimeout(() => {
        setDownloadAdded(false);
      }, 2000);
    }
  }, [downloadAdded]);

  useEffect(() => {
    setDPending(hasDPending());
  }, [downloads]);
  //   const initialized = useRef(false);
  const { user } = useAuthContext();
  const { renew } = useRenew();
  //   const socketHandlers = (socket, id) => {
  //     var channel = socket.channel(`user:${id}`);
  //     channel
  //       .join()
  //       .receive("ok", (resp) => {
  //         console.log("JOINED");
  //         channel.on("env", (msg) => {
  //           console.log(msg);
  //           dispatch({
  //             type: HANDLERS.UPDATE_ENV,
  //             payload: msg.env,
  //           });
  //         });
  //       })
  //       .receive("error", (resp) => {
  //         console.log("Unable to join", resp);
  //       });
  //   };

  const resetChecked = () => {
    setDChecked(0);
  };

  const download = async function (url, method = "get", rec, body) {
    setDChecked((d) => (d += 1));
    // var token = await renew();
    console.log(rec);

    const worker = new Worker("/assets/js/file.js");

    worker.onmessage = ({ data: [action, id, data] }) => {
      if (data.status == "Aborted") {
        worker.terminate();
      }
      switch (action) {
        case "append":
          {
            setDownloadAdded(true);
            setDownloads((downloads) => {
              return [...downloads, { ...data, worker: worker }];
            });
          }
          break;
        case "update":
          {
            setDownloads((downloads) => {
              var newdownloads = [...downloads];
              var idx = newdownloads.findIndex((item) => item.id == id);

              newdownloads[idx] = { ...newdownloads[idx], ...data };

              return newdownloads;
            });
          }
          break;
      }
    };

    worker.postMessage([
      "download",
      user.access_token,
      [url, method, rec, body],
    ]);
  };

  const cancelDownload = (id) => {
    var idx = downloads.map((item) => item.id).indexOf(id);
    downloads[idx].worker.postMessage(["abort"]);
  };

  const upload = async function (url, file, metadata = false, extra) {
    return new Promise(async (resolve, reject) => {
      var token = await renew();
      var data = new FormData();
      console.log(url);

      data.append("file", file);
      if (metadata) {
        data.append("meta", JSON.stringify(metadata));
      }

      let request = new XMLHttpRequest();
      request.open("POST", url);
      request.setRequestHeader("Authorization", token);

      var id = Math.floor(Math.random() * Date.now());
      console.log(id);
      // upload progress event
      var startTime = new Date();

      request.upload.addEventListener("progress", function (e) {
        // upload progress as percentage
        // console.log(e);
        var endTime = new Date();
        var timeDiff = endTime - startTime;
        if (timeDiff > 500) {
          let progress = e.loaded / e.total;

          // dispatch({
          //   type: HANDLERS.UPLOAD_PROGRESS,
          //   payload: {
          //     progress,
          //     id,
          //   },
          // });

          setUploads((uploads) => {
            const newUploads = [...uploads];
            var idx = uploads.findIndex((item) => item.id == id);
            if (progress > 0.99) {
              progress = 0.99;
            }
            newUploads[idx].progress = progress;
            return newUploads;
          });

          startTime = new Date();
          //   scope.update();
        }
      });

      request.addEventListener("error", function (e) {});

      // request finished event
      request.addEventListener("load", function (e) {
        console.log(request.status);
        console.log(request.response);
        if (request.status >= 300) {
          toast.error(request.response);
        }

        setUploads((uploads) => {
          var newUploads = [...uploads];
          var idx = newUploads.findIndex((item) => item.id == id);

          newUploads[idx].progress = 1;

          newUploads[idx].status = "Uploaded";
          return newUploads;
        });

        resolve(request);
      });

      request.addEventListener("abort", function (e) {
        setUploads((uploads) => {
          var newUploads = [...uploads];
          var idx = newUploads.findIndex((item) => item.id == id);
          console.log(idx);
          newUploads[idx].status = "Aborted";
          return newUploads;
        });
      });

      setUploads([
        ...uploads,
        {
          id: id,
          progress: 0,
          fname: file.name,
          request: request,
          status: "Uploading",
          ...extra,
        },
      ]);

      console.log(data);
      // send POST request to server
      request.send(data);
      //   if (show) {
      //     scope.show();
      //   }
      //   scope.update();
    });
  };

  const removeUpload = function (id) {
    var newUploads = [...uploads];
    var removeIndex = newUploads.map((item) => item.id).indexOf(id);
    removeIndex >= 0 && newUploads.splice(removeIndex, 1);
    setUploads(newUploads);
  };

  const hasDPending = () => {
    var downloadPending = downloads.filter(
      (item) => item.status == "Downloading"
    );
    return downloadPending.length;
  };

  const hasPending = function () {
    var pending = uploads.filter((item) => item.status == "Uploading");

    return pending.length;
  };

  // const cancelUpload = function (idx) {
  //   console.log(idx);
  //   console.log(uploads[idx]);
  //   uploads[idx].request.abort();
  // };
  //   useEffect(() => {
  //     initialize().catch(console.error);
  //   }, []);

  return (
    <FileContext.Provider
      value={{
        uploads,
        upload,
        removeUpload,
        pending,
        downloads,
        download,
        dPending,
        cancelDownload,
        downloadAdded,
        dChecked,
        resetChecked,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

// AuthProvider.propTypes = {
//   children: PropTypes.node,
// };

export const FileConsumer = FileContext.Consumer;

export const useFileContext = () => useContext(FileContext);
