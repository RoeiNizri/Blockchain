const timeout = setTimeout(function() {
    window.location.reload();
  }, 5000);
  
  // Clear the timeout if the page loads successfully
  window.onload = function() {
    clearTimeout(timeout);
  };