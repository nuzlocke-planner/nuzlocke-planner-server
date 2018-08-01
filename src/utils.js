function log(message) {
  if(process.env.NODE_ENV !== 'test')
    console.log(getDate() + " " + message);
}

function getDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  var hours = today.getHours();
  var min = today.getMinutes();
  var sec = today.getSeconds();

  return "[" + dd + "-" + mm + "-" + yyyy + " " + hours + ":" + min + ":" + sec + "]";
}

exports.log = log;