export default function randomizeWheel<T>(options: T[]): T {
    const idx = Math.floor(Math.random() * options.length);
    return options[idx];
  }
  