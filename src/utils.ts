const randomInt = (low: number, high: number) => {
  return Math.floor(Math.random() * (high - low) + low);
};

export default {
  randomInt,
};
