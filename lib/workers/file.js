const updateDelay = 1000;
var download;

onmessage = ({ data: [action, token, params] }) => {
  console.log(download);
  switch (action) {
    case "download":
      {
        var d = new Download(token, ...params);
        download = d;
      }
      break;
    case "abort":
      {
        download.cancel();
      }
      break;
  }
};

class Download {
  constructor(...params) {
    this.download(...params);
    this.keepReading = true;
    this.stream = null;
  }

  cancel() {
    console.log(this);
    this.keepReading = false;
    // this.stream.cancel();
  }

  async download(token, url, method, record, body) {
    var scope = this;
    var filename;
    var id = Math.floor(Math.random() * Date.now());
    console.log(id);
    await fetch(url, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      method: method,
      body: method.toLowerCase() == "get" ? null : JSON.stringify(body),
    })
      .then(async (response) => {
        if (response.ok) {
          var progress = 0;
          var size;

          for (let entry of response.headers.entries()) {
            console.log(entry);
            if (entry[0] == "content-length") {
              size = entry[1];
            }
            if (entry[0] == "content-disposition") {
              filename = entry[1].match(/filename="(.+)"/)[1];
            }
          }

          if (!size && record.fsize) {
            size = record.fsize;
          }
          console.log(size);

          console.log(response);

          // upload progress event
          var startTime = new Date();

          postMessage([
            "append",
            id,
            {
              id: id,
              progress: 0,
              fname: filename,

              // request: request,
              status: "Downloading",
            },
          ]);

          const reader = response.body.getReader();

          var stream = new ReadableStream({
            start(controller) {
              function pump() {
                return reader.read().then(({ done, value }) => {
                  // When no more data needs to be consumed, close the stream
                  if (done) {
                    console.log("done");
                    postMessage([
                      "update",
                      id,
                      { status: "Downloaded", progress: 1 },
                    ]);

                    controller.close();
                    return;
                  }
                  // Enqueue the next data chunk into our target stream
                  progress += value.length;

                  var endTime = new Date();
                  var timeDiff = endTime - startTime;
                  if (timeDiff > updateDelay) {
                    var prog = progress;
                    if (size) {
                      prog /= size;
                    }

                    var data = { progress: prog };
                    postMessage(["update", id, data]);
                    startTime = new Date();
                  }

                  if (scope.keepReading) {
                    controller.enqueue(value);
                    return pump();
                  } else {
                    controller.close();
                    postMessage(["update", id, { status: "Aborted" }]);
                  }
                });
              }
              return pump();
            },
          });
          scope.stream = stream;
          return stream;
        } else {
          postMessage(["update", id, { status: "Error" }]);
        }
      })
      .then((stream) => new Response(stream))
      .then((response) => response.blob())
      .then((blob) => {
        console.log(blob);
        console.log("done");
        const url = URL.createObjectURL(blob);
        postMessage(["update", id, { downloadUrl: url }]);

        // const link = document.createElement("a");
        // link.href = url;
        // link.setAttribute("download", filename);
        // document.body.appendChild(link);
        // msgbox.close();
        // link.click();
        // link.remove();
      })
      .catch((err) => console.error(err));
  }
}
