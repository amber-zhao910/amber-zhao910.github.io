console.log('dark mode');

//------------------------------------
// Wait for the DOM to fully load
//------------------------------------
document.addEventListener("DOMContentLoaded", function () {

  //------------------------------------
  // show hide each item
  //------------------------------------
  const items = document.querySelectorAll('.item');
  items.forEach(function(item) {
    item.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });

  //---------------------------
  // setup show hide all button
  //---------------------------
  const showHideButton = document.getElementById('showhide');
  showHideButton.addEventListener('click', function() {
    items.forEach(function(item) {
      item.classList.toggle('active');
    });
  });

  //------------------------------------
  // adds a darkmode class to the body
  //------------------------------------
  const darkModeButton = document.getElementById('darkmode');
  darkModeButton.addEventListener('click', function() {
    document.body.classList.toggle('darkmode');
  });

});