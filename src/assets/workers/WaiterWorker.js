importScripts('/classes/ParallelSync.js');

self.onmessage = event => {
  switch (event.data.msgType) {
    case "startWaiting":
      startWaiting(event);
      break;
    case "termiante":
      //console.log("waiter terminated");
      self.close();
      break;
  }
};

//console.log("Manager Initialized...");

function startWaiting(event) {
  //console.log('waiter started');
  // Deserialize data.
  const {swg} = event.data;
  const wg = WaitGroup.connect(swg);
  //const count = new Int32Array(sc);

  // Wait for workers to terminate.
  wg.wait();

  // The following lines will always execute last.
  //console.log("final value:", count)
  //console.log('waiter done');
  postMessage({msgType: "noiseReady"});
}
