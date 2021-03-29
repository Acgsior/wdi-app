const playAnimation = (animateMethods, selector, keyframes, duration, callback, options = { clear = true, clearOptions = null }) => {
  console.log(`= [animate] animation of ${selector} begins`);

  const { animate, clearAnimation } = animateMethods;
  animate(selector, keyframes, duration, function () {
    console.log(`= [animate] animation of ${selector} completed`);

    callback && callback();

    const { clear, clearOptions, clearCallback } = options;
    if (clear) {
      clearAnimation(selector, clearOptions, function () {
        console.log(`= [clear-animate] animation of ${selector} completed`);

        clearCallback && clearCallback();
      });
    } else {
      console.log(`= [clear-animate] animation of ${selector} completed`);
    }
  });
};

export default playAnimation;
