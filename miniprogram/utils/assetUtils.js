const autoIncreaseLoadPercent = percent => {
  let increment = 5;
  if (percent >= 40) {
    increment = 4;
  }
  if (percent >= 60) {
    increment = 2;
  }
  if (percent >= 80) {
    increment = 1;
  }
  if (percent >= 90) {
    increment = 0;
  }
  return percent + increment;
}

export default {
  autoIncreaseLoadPercent
};
