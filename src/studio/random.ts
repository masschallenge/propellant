export type Chooser = <Item>(items: Item[]) => Item;

export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};

export const createChooser = (seed: number): Chooser => {
  const random = createRandom(seed);
  return <Item>(items: Item[]): Item => {
    if (!items.length) throw new Error('Nothing to choose from');
    if (seed === 0) return items[0];
    return items[Math.floor(random() * items.length)];
  };
};
