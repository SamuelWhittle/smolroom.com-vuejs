import type { App } from 'vue';

const directiveLongpress = (app: App<Element>) => {
  return app.directive('longpress', {
    beforeMount: function (el: Element, binding) {
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
      let pressCoords: number[] = [];

      // Define funtion handlers
      // Create timeout ( run function after 1s )
      let start = (e: any) => {
        console.log(e.button);

        if (e.type === 'click' && e.button !== 0) {
          return;
        }

        if (pressTimer === 0) {
          pressTimer = setTimeout((e: any) => {
            // Run function
            handler(e);
          }, 1000)
        }
      }

      let checkMovement = (e: any) => {
        console.log(e);
      }

      // Cancel Timeout
      let cancel = () => {
        // Check if timer has a value or not
        if (pressTimer !== 0) {
          clearTimeout(pressTimer);
          pressTimer = 0;
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
      el.addEventListener("mouseout", cancel);
      el.addEventListener("touchend", cancel);
      el.addEventListener("touchcancel", cancel);
      // Cancel timeouts if too much movement occurs
      el.addEventListener('mousemove', checkMovement);
      el.addEventListener('touchmove', checkMovement);
    }
  })
}

export default directiveLongpress;
