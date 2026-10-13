console.log('dark mode');

//------------------------------------
// Wait for the DOM to fully load
//------------------------------------
document.addEventListener("DOMContentLoaded", function () {

  const fireToggle = document.getElementById('fireToggle');

  fireToggle.addEventListener('click', function() {
    fireToggle.classList.toggle('off');
    document.body.classList.toggle('darkmode');
  });

});

