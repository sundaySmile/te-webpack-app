import { isX5PoweredBrowser } from './UserAgent';

const isX5 = isX5PoweredBrowser();

export const isWindowEmbbed = window.parent !== window.self;

export const targetWindow = isWindowEmbbed ? window.parent : window.self;

export function getDeviceOrientation() {
  if (targetWindow.screen && 'orientation' in targetWindow.screen) {
    return targetWindow.screen.orientation.angle;
  }
  return targetWindow.orientation || 0;
}

/**
 * @typedef {Object} WindowRect
 * @property {number} width window's width.
 * @property {number} height window's height.
 */

/**
 * @desc Get the correct window rect(width and height)
 * @return {Object} WindowRect
 */
export function targetWindowRect(fullscreen = false) {
  const orientation = getDeviceOrientation();
  let width = targetWindow.document.documentElement.clientWidth;
  let height = targetWindow.document.documentElement.clientHeight;
  if (isX5) {
    width = targetWindow.innerWidth;
    height = targetWindow.innerHeight;
    if (fullscreen) {
      width = targetWindow.screen.width;
      height = targetWindow.screen.height;
    }
  }
  if (
    (!orientation && width > height) ||
    (orientation && width < height)
  ) {
    [width, height] = [height, width];
  }
  return {
    width,
    height
  };
}
