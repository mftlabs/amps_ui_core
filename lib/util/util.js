import { PushPinOutlined } from "@mui/icons-material";
import axios from "axios";
import { Socket } from "phoenix";
import { useEffect, useRef, useState } from "react";
import { useUIContext } from "../contexts/UIContext";

export const useRequest = () => {
  const { useAuthContext } = useUIContext();
  const { renew } = useAuthContext();
  const request = (params, { onSuccess, onError } = {}) => {
    var renewed = false;

    const signout = (resp) => {
      const doSignOut = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("user");
        localStorage.removeItem("renewal_token");
        //   location.reload();
      };
      console.log(resp.status == 401);
      if (resp.status == 401) {
        doSignOut();
      } else {
        if (onError) {
          onError(resp);
        } else {
          doSignOut();
        }
      }
    };
    const signin = (data) => {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("renewal_token", data.renewal_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    };

    return new Promise(async (resolve, reject) => {
      const fetchData = async (params, header = null) => {
        try {
          var config = {
            ...params,
            headers: {
              ...params.headers,
              Authorization: header || localStorage.getItem("access_token"),
            },
          };
          const res = await axios.request(config);
          resolve(res);
        } catch (err) {
          console.log(err);
          var resp = err.response;
          if (renewed) {
            reject(resp);
          } else {
            if (resp.status == 401) {
              renew()
                .then(async (token) => {
                  renewed = true;
                  await fetchData(params, token);
                })
                .catch((e) => {
                  reject(e);
                });
            } else {
              reject(resp);
            }
          }
        }
      };
      return await fetchData(params);
    });
  };

  return request;
};

export async function request(params, { onSuccess, onError } = {}) {
  var renewed = false;

  const signout = (resp) => {
    const doSignOut = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("renewal_token");
      //   location.reload();
    };
    console.log(resp.status == 401);
    if (resp.status == 401) {
      doSignOut();
    } else {
      if (onError) {
        onError(resp);
      } else {
        doSignOut();
      }
    }
  };
  const signin = (data) => {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("renewal_token", data.renewal_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  return new Promise(async (resolve, reject) => {
    const fetchData = async (params, header = null) => {
      try {
        var config = {
          ...params,
          headers: {
            ...params.headers,
            Authorization: header || localStorage.getItem("access_token"),
          },
        };
        const res = await axios.request(config);
        resolve(res);
      } catch (err) {
        console.log(err);
        var resp = err.response;
        if (renewed) {
          reject(resp);
        } else {
          if (resp.status == 401) {
            axios
              .post(
                "/api/session/renew",
                {},
                {
                  headers: {
                    Authorization: localStorage.getItem("renewal_token"),
                  },
                }
              )
              .then(async ({ data }) => {
                data = data.data;
                signin(data);
                renewed = true;
                await fetchData(params, data.access_token);
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            reject(resp);
          }
        }
      }
    };
    return await fetchData(params);
  });
}

export const useQueryFn = () => {
  const { store } = useUIContext();
  const request = useRequest();
  const queryFn = (route, filters = {}) => {
    return new Promise(async (resolve, reject) => {
      const fetchURL = new URL(
        `/api${store ? `/store${route}` : route}`,
        document.URL
      );
      fetchURL.searchParams.set("params", JSON.stringify({ filters: filters }));
      request({
        url: fetchURL.href,
        method: "get",
      })
        .then((response) => {
          resolve(response.data?.rows ?? []);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return queryFn;
};
export const queryFn = async (route, filters = {}) => {
  const fetchURL = new URL(`/api/store${route}`, document.URL);
  fetchURL.searchParams.set("params", JSON.stringify({ filters: filters }));
  const response = await request({
    url: fetchURL.href,
    method: "get",
  });
  console.log(response);

  return response.data?.rows ?? [];
};

export class TopicBuilder {
  constructor(formik) {
    this.formik = formik;
    this.operations = [];
    this.building = false;
  }

  add(val, idx, valField) {
    this.operations.push({ val, idx, valField });
    if (!this.building) {
      while (this.operations.length) {
        this.building = true;
        var parms = this.operations.pop();
        this.doAdd(parms.val, parms.idx, parms.valField);
      }
      this.building = false;
    }
  }

  doAdd(val, idx, valField) {
    var formik = this.formik;
    if (typeof val === "object" && val !== null) {
      val = val[valField];
    }

    console.log(val);
    var pieces = formik.values.topic.split(".");

    pieces[idx] = val;
    pieces[0] = "amps";
    console.log(pieces);
    if (idx == 1) {
      var d = formik.values["desc"];
      formik.resetForm();
      pieces[2] = "-";
      if (pieces.length == 4) {
        pieces[3] = "-";
      }

      formik.setFieldValue("desc", d);
    }

    if (idx == 2 && pieces.length == 4) {
      pieces[3] = "-";
    }

    formik.setFieldValue("topic", pieces.join("."));
  }
}

export const topicBuilder = (formik, val, idx, valField) => {
  if (typeof val === "object" && val !== null) {
    val = val[valField];
  }

  var pieces = formik.values.topic.split(".");

  pieces[idx] = val;
  pieces[0] = "amps";
  if (idx == 1) {
    var d = formik.values["desc"];
    formik.resetForm();
    pieces[2] = "-";
    if (pieces.length == 4) {
      pieces[3] = "-";
    }

    formik.setFieldValue("desc", d);
  } else {
    if (pieces[1] == "-") {
      pieces[1] = formik.values.type;
    }
  }

  if (idx == 2 && pieces.length == 4) {
    pieces[3] = "-";
  }
  console.log(pieces);

  formik.setFieldValue("topic", pieces.join("."));
};

// export const channelHandlers = async function (channel) {
//   channel
//     .join()
//     .receive("ok", (resp) => {
//       console.log("Joined successfully", resp);
//     })
//     .receive("error", (resp) => {
//       console.log("Unable to join", resp);
//     });
//   channel.on("update", (msg) => {
//     console.log(msg);
//     amfutil.stores
//       .filter((store) => store.config.collection == msg.page)
//       .forEach((store) => store.store.reload());
//     if (msg.page == Ext.util.History.getToken())
//       Ext.toast({
//         html: "This data has been updated",
//         title: "Alert",
//         autoCloseDelay: 5000,
//       });
//   });

//   var user = await amfutil.fetch_user();
//   console.log(user);

//   channel.on(user.username, async (event) => {
//     if (event["env"] == "reset") {
//       amfutil.updateEnv();
//     }
//   });
//   console.log(channel);
// };

export const useRenew = () => {
  const { useAuthContext = () => ({ signIn: null, user: null }) } =
    useUIContext();
  let { signIn, user } = useAuthContext();
  const [promise, setPromise] = useState(false);
  const renew = async (props) => {
    var providedSignIn;
    var providedUser;
    if (props) {
      providedSignIn = props.signIn;
      providedUser = props.providedUser;
    }
    signIn = providedSignIn ? providedSignIn : signIn;
    user = providedUser ? providedUser : user;

    if (promise) {
      return promise;
    } else {
      var r = new Promise(function (resolve, reject) {
        axios
          .request({
            url: "/api/session/renew",
            headers: {
              Authorization: user.renewal_token,
            },
            method: "POST",
            timeout: 30000,
          })
          .then((resp) => {
            signIn(resp.data.data);
            var token = resp.data.data.access_token;

            localStorage.setItem("access_token", token);
            localStorage.setItem("renewal_token", resp.data.data.renewal_token);
            resolve(token);
          })
          .catch(() => {
            reject();
          });
      });
      setPromise(r);
      var token = await r;
      setPromise(null);
      return token;
    }
  };
  return { renew };
};

export const useSocket = (
  channel_name,
  { subscriptions = [], enabled = true }
) => {
  const { useAuthContext } = useUIContext();

  const { user, renew } = useAuthContext();
  const channelRef = useRef();

  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (enabled) {
      setUpdated(true);
    }
  }, [channel_name]);

  useEffect(() => {
    if (updated) {
      cleanup();
      joinChannel();
      setUpdated(false);
    }
  }, [updated]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  function cleanup() {
    if (channelRef.current) {
      return channelRef.current.leave();
    }
  }

  function joinChannel() {
    cleanup();

    var cnl = user.socket.channel(channel_name);

    cnl
      .join()
      .receive("ok", (resp) => {
        subscriptions.forEach(({ event, callback }) => {
          cnl.on(event, (msg) => {
            callback(msg);
          });
        });
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
    // console.log(cnl);

    channelRef.current = cnl;
  }

  const socketPromise = () => {
    new Promise(function (resolve, reject) {
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      var token = localStorage.getItem("access_token");
      console.log(token);
      var nsocket = new Socket("/socket", {
        params: { token: token },
      });
      nsocket.connect();

      nsocket.onError(async function (e) {
        console.log(e);

        socket.disconnect();
        // amfutil.socketPromise = null;

        // await amfutil.renew_session();

        reject();
      });

      nsocket.onOpen(async function () {
        var channel = nsocket.channel("notifications");

        amfutil.channel = channel;

        amfutil.channelHandlers(channel);
        amfutil.socketPromise = null;
        resolve();
      });
    });
  };

  const socketLoop = function (
    event,
    parms,
    callback,
    time = 1000,
    cond = function () {
      return true;
    }
  ) {
    function broadcast(data) {
      broadcastEvent(event, parms, (payload) => {
        callback(payload);
      });
    }
    var timer = setInterval(function () {
      if (cond()) {
        broadcast();
      } else {
        clearInterval(timer);
      }
    }, time);
    broadcast();
    return timer;
  };

  async function broadcastEvent(event, message, callback) {
    console.log(channelRef);
    // if (amfutil.socketPromise) {
    //   return;
    // }
    // if (event == "update") {
    //   amfutil.stores
    //     .filter((store) => store.config.collection == message.page)
    //     .forEach((store) => store.store.reload());
    // }
    if (channelRef.current) {
      var push = channelRef.current.push(event, message, 10000);
      if (callback) {
        push
          .receive("ok", (payload) => callback(payload))
          .receive("error", (err) => console.log("phoenix errored", err))
          .receive("timeout", async () => {
            // await amfutil.updateChannel();
            console.log("timed out pushing");
          });
      }
    }
  }

  return { broadcastEvent, socketLoop, channelRef, cleanup };
};

export const updateChannel = async function () {
  if (amfutil.socketPromise) {
    await amfutil.socketPromise;
  } else {
    amfutil.socketPromise = new Promise(function (resolve, reject) {
      if (amfutil.socket) {
        amfutil.socket.disconnect();
        delete amfutil.socket;
      }
      var token = localStorage.getItem("access_token");
      console.log(token);
      amfutil.socket = new window.pSocket("/socket", {
        params: { token: token },
      });
      amfutil.socket.connect();

      amfutil.socket.onError(async function (e) {
        console.log(e);

        amfutil.socket.disconnect();
        amfutil.socketPromise = null;

        await amfutil.renew_session();

        reject();
      });

      amfutil.socket.onOpen(async function () {
        var channel = amfutil.socket.channel("notifications");

        amfutil.channel = channel;

        amfutil.channelHandlers(channel);
        amfutil.socketPromise = null;
        resolve();
      });
    });
    await amfutil.socketPromise;
  }
};

export const getById = (collection, id) => {
  return new Promise((resolve, reject) => {
    request({
      method: "get",
      url: `/api/${collection}/${id}`,
    })
      .then((resp) => {
        resolve(resp.data);
      })
      .catch((resp) => {
        reject(resp);
      });
  });
};

export const mapping = {
  action: { label: "Action" },
  data: { label: "Message Data" },
  etime: { label: "Event Time" },
  fname: { label: "Message Name" },
  fpath: { label: "Message Path" },
  fsize: { label: "Message Size" },
  ftime: { label: "Message Time" },
  ktopic: { label: "Kafka Topic" },
  mailbox: { label: "Mailbox" },
  msgid: { label: "Message ID" },
  mtime: { label: "Mailbox Time" },
  parent: { label: "Parent" },
  recipient: { label: "Recipient" },
  rel: { label: "Relevance" },
  service: { label: "Service" },
  sid: { label: "Session ID" },
  status: { label: "Status" },
  subscriber: { label: "Subscriber" },
  topic: { label: "Topic" },
  user: { label: "User" },
  _id: { label: "Database ID" },
  index: { label: "Database Index" },
  method: { label: "Request Method" },
  request_path: { label: "Request Path" },
  route_path: { label: "Route Path" },
  stime: { label: "Status Time" },
  path_params: { label: "Path Params" },
};

export const outputTopic = {
  type: "select",
  name: "output",
  label: "Output Topic",
  route: "/topics",
  valField: "topic",
  labelField: "topic",
  dynamic: true,
};
