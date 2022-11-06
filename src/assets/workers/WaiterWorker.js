importScripts('/classes/ParallelSync.js');

self.onmessage = event => {
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
};

//console.log("Manager Initialized...");
