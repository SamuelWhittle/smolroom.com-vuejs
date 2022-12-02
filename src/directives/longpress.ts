import type { App } from 'vue';

const directiveLongpress = (app: App<Element>) => {
  return app.directive('longpress', {
    beforeMount: function(el: Element, binding) {
      // Make sure expression provided is a function
      if (typeof binding.value !== 'function') {
        // Fetch name of component
        //const compName = vNode.context.name;
        // pass warning to console
        //let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be`;
        //if (compName) { warn += `Found in component '${compName}' ` }
        console.warn("[longpress:] provided expression is not a function, but needs to be.");
      }

      // Define variables
      let pressTimer: number = 0;
      let pressing: boolean = false;
      let pressCoords: number[] = [];

      // Define funtion handlers
      // Create timeout ( run function after 1s )
      let start = (e: any) => {
        if (e.type === 'mousedown' && e.button !== 0) {
          return;
        }

        pressing = true;

        if (e.type === "mousedown") {
          pressCoords = [e.clientX, e.clientY];
        } else if (e.type === "touchstart") {
          pressCoords = [(e.touches[0].clientX), (e.touches[0].clientY)]
        }

        if (pressTimer === 0) {
          pressTimer = setTimeout((e: any) => {
            // Run function
            handler(e);
          }, 500)
        }
      }

      // Cancel Timeout
      let cancel = () => {
        // Check if timer has a value or not
        if (pressTimer !== 0) {
          clearTimeout(pressTimer);
          pressCoords = [0, 0];
          pressing = false;
        }
        pressTimer = 0;
      }

      let checkMovement = (e: any) => {
        if (pressing) {
          if (e.type === "mousemove") {
            if ((Math.abs(pressCoords[0] - e.clientX) > 10) || (Math.abs(pressCoords[1] - e.clientY) > 10)) {
              cancel();
            }
          } else if (e.type === "touchmove") {
            if ((Math.abs(pressCoords[0] - e.touches[0].clientX) > 10) || (Math.abs(pressCoords[1] - e.touches[0].clientY) > 10)) {
              cancel();
            }
          }
        }
      }

      // Run Function
      const handler = (e: any) => {
        binding.value(e);
      }

      // Add Event listeners
      el.addEventListener("mousedown", start);
      el.addEventListener("touchstart", start);
      // Cancel timeouts if this events happen
      el.addEventListener("click", cancel);
      el.addEventListener("mouseup", cancel);
      el.addEventListener("touchend", cancel);
      el.addEventListener("touchcancel", cancel);
      // Cancel timeouts if too much movement occurs
      el.addEventListener('mousemove', checkMovement);
      el.addEventListener('touchmove', checkMovement);
    }
  })
}

export default directiveLongpress;
