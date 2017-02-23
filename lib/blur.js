const BLUR = (function(doc){
  const blur = 'blur(3px)';
  const noBlur = 'blur(0px)';

  return {
    add: () => {
      let element = doc.querySelector('#calmaster');
      element.style.filter = blur;
    },
    remove: () => {
      let element = doc.querySelector('#calmaster');
      element.style.filter = noBlur;
    }
  };
})(document);

module.exports = BLUR;
