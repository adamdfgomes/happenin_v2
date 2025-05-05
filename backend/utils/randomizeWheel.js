// backend/utils/randomizeWheel.js
/**
 * Pick a random element from the given array.
 * @param {any[]} options
 * @returns {any}
 */
export default function randomizeWheel(options) {
  const idx = Math.floor(Math.random() * options.length);
  return options[idx];
}
