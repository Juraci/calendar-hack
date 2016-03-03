var HIGHLIGHT = (function(){
    var boxShadow = "0 0 15px rgba(81, 250, 200, 1)";
    var border = "1px solid rgba(81, 250, 200, 1)";
    var glowCount = 0;
    var glowLimit = 3;

    return {
        glow: function(element) {
            var originalBoxShadow = element.style.boxShadow;
            var originalBorder = element.style.border;

            var id = setInterval(function(){
                glowCount++;
                element.style.boxShadow = boxShadow;
                element.style.border = border;
                setTimeout(function() {
                    element.style.boxShadow = originalBoxShadow;
                    element.style.border = originalBorder;
                }, 1000);

                if(glowCount >= glowLimit) {
                    clearInterval(id);
                }
            }, 2000);
        }
    };
})();

module.exports = HIGHLIGHT;
