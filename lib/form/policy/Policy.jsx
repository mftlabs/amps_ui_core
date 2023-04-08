import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import SvgIcon from "@mui/material/SvgIcon";
import { alpha, styled } from "@mui/material/styles";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";
import Collapse from "@mui/material/Collapse";
import { useSpring, animated } from "@react-spring/web";
import { Loader, useRequest } from "amps_ui_core";
import { useQuery } from "@tanstack/react-query";
import {
  Autocomplete,
  Box,
  IconButton,
  ListItem,
  ListItemText,
  Switch,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import Editor from "@monaco-editor/react";

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}
    >
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

function TransitionComponent(props) {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: "translate3d(20px,0,0)",
    },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,
};

const StyledTreeItem = styled((props) => (
  <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

const ToggleTreeItem = styled((props) => {
  console.log(props);
  return (
    <ListItem dense={true} TransitionComponent={TransitionComponent}>
      <ListItemText>{props.label}</ListItemText>
      <Switch
        checked={props.value}
        onChange={(e, value) => {
          props.handleToggle(props.path, value);
        }}
      />
    </ListItem>
  );
})(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

export function Policy({ field, formik }) {
  const request = useRequest();
  const [options, setOptions] = useState([]);
  const [policy, setPolicy] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [objects, setObjects] = useState([]);
  const [value, setValue] = useState(null);
  const [type, setType] = useState("tree");

  const changeType = (event, newValue) => {
    setType(newValue);
  };

  const getSchemas = (strings) => {
    // Create an object to store the first parts of each string
    const firstParts = {};
    // Iterate through all strings in the list
    for (let i = 0; i < strings.length; i++) {
      // Get the first part of the string before the first period
      const firstPart = strings[i].split(".")[0];
      // Add the first part to the object if it hasn't been added already
      if (!firstParts[firstPart]) {
        firstParts[firstPart] = true;
      }
    }
    // Return an array of all the keys in the firstParts object
    return Object.keys(firstParts);
  };

  const handleToggle = (value, addValue) => {
    console.log(value);
    var np;
    if (addValue) {
      np = [...policy, value];
    } else {
      np = policy.filter((item) => item !== value);
    }
    setPolicy(np);
    if (addValue) {
      var exp = getExpanded(np);

      setExpanded(exp);
    }
  };

  const getPaths = (obj, parentKey = "") => {
    let paths = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let currentKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === "object") {
          let subPaths = getPaths(obj[key], currentKey);
          paths = [...paths, ...subPaths];
        } else {
          paths.push(currentKey);
        }
      }
    }
    return paths;
  };

  const objectToggle = (obj, value) => {
    // Iterate through all keys in the object
    for (let key in obj) {
      // If the current value is an object, recursively call this function on it
      if (typeof obj[key] === "object" && obj[key] !== null) {
        objectToggle(obj[key], value);
      } else {
        // Otherwise, set the value to the specified value
        obj[key] = value;
      }
    }
  };

  const toggleState = (prefix) => {
    var obj = prefix.split(".").reduce((acc, curr) => acc[curr], data);
    var paths = getPaths(obj, prefix);
    return paths.every((value) => policy.includes(value));
  };

  const getExpanded = (list) => {
    var p = list ? list : policy;

    var exp = p
      .map((str) => {
        const [first, ...rest] = str.split(".").slice(0, -1);
        return rest.length ? [first, ...rest].join(".") : first;
      })
      .concat(objects);
    console.log(exp);
    return [...new Set(exp)];
  };

  const toggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["schema"],
    queryFn: () => {
      const queryFn = async () => {
        const resp = await request({
          url: "/api/util/schema",
          method: "get",
        });

        return resp.data;
      };
      return queryFn();
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    console.log(data);
    if (data) {
      setOptions(Object.keys(data));
    }
  }, [data]);

  const editorCustomOptions = {
    glyphMargin: true,
    lightbulb: {
      enabled: true,
    },
    fixedOverflowWidgets: true,
    padding: { top: 16 },
  };
  const onChange = (value) => {
    try {
      var p = JSON.parse(value);
      setPolicy(p);
    } catch (e) {}

    // formik.setFieldValue(field.name, value);
  };

  const onMount = (editor) => {
    editor.updateOptions({ readOnly: field.readOnly });
  };

  useEffect(() => {
    setObjects(getSchemas(policy));
  }, []);

  useEffect(() => {
    console.log(expanded);
  }, [expanded]);

  useEffect(() => {
    console.log(policy);
    formik.setFieldValue(field.name, policy);
  }, [policy]);

  return (
    <Box sx={{ p: 3, flex: 1, height: "100%" }}>
      <Tabs value={type} onChange={changeType} aria-label="basic tabs example">
        <Tab label="Tree" value="tree" />
        <Tab label="JSON" value="json" />
      </Tabs>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {type == "tree" && (
            <>
              <Autocomplete
                sx={{ flex: 1 }}
                value={value}
                clearOnBlur
                onChange={(event, value) => {
                  console.log(event);

                  setObjects((objects) => {
                    objects.push(value);
                    return objects;
                  });
                  setOptions((options) => options.filter((o) => o != value));
                  setExpanded(getExpanded());
                  setValue(null);
                  event.target.blur();
                }}
                options={options}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    value={value}
                    label="Select Object"
                    variant="standard"
                  />
                )}
              />
              <TreeView
                aria-label="customized"
                expanded={expanded}
                defaultExpanded={getExpanded()}
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
                onNodeToggle={toggle}
                sx={{
                  height: "100%",
                  flexGrow: 1,
                  maxWidth: 400,
                  overflowY: "auto",
                }}
              >
                {objects.map((k1, index) => {
                  console.log(k1);
                  var v1 = data[k1];
                  return (
                    <StyledTreeItem nodeId={k1} label={k1}>
                      <Switch
                        onChange={(event, value) => {
                          var gp = getPaths(data[k1], k1);
                          console.log(gp);
                          var np = [...policy];
                          if (value) {
                            np = np.concat(gp);
                            np = [...new Set(np)];
                          } else {
                            const set = new Set(gp);
                            np = np.filter((value) => !set.has(value));
                          }
                          console.log(np);
                          setPolicy(np);
                          setExpanded(getExpanded(np));
                        }}
                        checked={toggleState(k1)}
                      />
                      {Object.entries(v1).map(([k2, v2], index2) => {
                        if (typeof v2 == "object") {
                          var p = [k1, k2].join(".");
                          return (
                            <StyledTreeItem expanded nodeId={p} label={k2}>
                              <Switch
                                onChange={(event, value) => {
                                  var gp = getPaths(data[k1][k2], p);
                                  console.log(gp);
                                  var np = [...policy];
                                  if (value) {
                                    np = np.concat(gp);
                                    np = [...new Set(np)];
                                  } else {
                                    const set = new Set(gp);
                                    np = np.filter((value) => !set.has(value));
                                  }

                                  setPolicy(np);
                                  setExpanded(getExpanded(np));
                                }}
                                checked={toggleState(p)}
                              />
                              {Object.entries(v2).map(([k3, v3]) => {
                                var path = [k1, k2, k3].join(".");

                                return (
                                  <ToggleTreeItem
                                    handleToggle={handleToggle}
                                    label={k3}
                                    value={policy.includes(path)}
                                    path={path}
                                  />
                                );
                              })}
                            </StyledTreeItem>
                          );
                        } else {
                          var path = [k1, k2].join(".");
                          return (
                            <ToggleTreeItem
                              handleToggle={handleToggle}
                              label={k2}
                              value={policy.includes(path)}
                              path={path}
                            />
                          );
                        }
                      })}
                    </StyledTreeItem>
                  );
                })}
                {/* <StyledTreeItem nodeId="1" label="Main">
              <StyledTreeItem nodeId="2" label="Hello" />
              <StyledTreeItem nodeId="3" label="Subtree with children">
                <StyledTreeItem nodeId="6" label="Hello" />
                <StyledTreeItem nodeId="7" label="Sub-subtree with children">
                  <StyledTreeItem nodeId="9" label="Child 1" />
                  <StyledTreeItem nodeId="10" label="Child 2" />
                  <StyledTreeItem nodeId="11" label="Child 3" />
                </StyledTreeItem>
                <StyledTreeItem nodeId="8" label="Hello" />
              </StyledTreeItem>
              <StyledTreeItem nodeId="4" label="World" />
              <StyledTreeItem nodeId="5" label="Something something" />
            </StyledTreeItem> */}
              </TreeView>
            </>
          )}
          {type == "json" && (
            <Editor
              options={editorCustomOptions}
              height="60vh"
              defaultLanguage="json"
              onMount={onMount}
              onChange={onChange}
              theme="vs-dark"
              value={JSON.stringify(policy, null, 4)}
            />
          )}
        </>
      )}
    </Box>
  );
}