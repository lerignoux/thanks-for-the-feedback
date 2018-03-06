window.onload = function () {

  //first define your getCookie function
  getCookie = function(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }

  logout = function(){
      var postUrl = "accounts/logout/",  // href attribute of clicked link
          xhr = new XMLHttpRequest();

      xhr.open('POST', postUrl);
      xhr.setRequestHeader('Content-Type', 'text/html; charset=utf-8');
      xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
      xhr.onload = function() {
          if (xhr.status === 200) {
              alert('Logged out');
          }
          else if (xhr.status !== 200) {
              alert('Request failed. Couldnot logout');
          }
      };
      xhr.send();
      alert("logout");
  }
}
