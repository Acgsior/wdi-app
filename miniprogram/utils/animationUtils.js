const pushIfAbsent = (array, element) => {
  const filteredArray = array.filter(item => item !== element);
  if (array.length === filteredArray.length) {
    return [...array, element];
  }
  // return original array ref to avoid render
  return array;

};

export default {
  pushIfAbsent
};
