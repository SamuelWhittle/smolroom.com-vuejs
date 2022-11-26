import { ref } from 'vue'
import { useEventListener } from './event'

export function useMouseDown(element) {
  const x = ref(0)
  const y = ref(0)

  useEventListener(element, 'mousedown', (event) => {
    x.value = event.pageX
    y.value = event.pageY
  })

  return { x, y }
}

export function useMouseMove(element) {
  const x = ref(0)
  const y = ref(0)

  useEventListener(element, 'mousemove', (event) => {
    x.value = event.pageX
    y.value = event.pageY
  })

  return { x, y }
}

export function useTouchStart() {
  const touchCoords = ref(new Array());

  useEventListener(window, 'touchstart', (event) => {
    touchCoords.value = new Array();
    event.touches.forEach((touch, index) => {
      touchCoords.value[index] = [touch.pageX, touch.pageY]
    })
  })

  return { touchCoords }
}
