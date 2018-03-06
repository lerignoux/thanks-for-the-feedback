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
              window.location.href = "";
          }
          else if (xhr.status !== 200) {
              alert('Request failed. Couldnot logout');
          }
      };
      xhr.send();
  }

  // Direct logout on button click
  // document.getElementById("logoutButton").addEventListener("click", logout);

  toClipboard = function(){
    let data = document.getElementById("campaignLink").firstChild.data,
        copyFrom = document.createElement("textarea");
    document.body.appendChild(copyFrom);
    copyFrom.textContent = data;
    copyFrom.select();
    document.execCommand("copy");
    copyFrom.remove();
  }

  // Clipboard copy
  document.getElementById('clipboardButton').addEventListener("click", toClipboard);
}
