<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Electricity System</title>
    <link type="text/css" rel="stylesheet" href="{{webRoot}}static/index.css">
    <link rel="icon" type="image/x-icon" href="{{webRoot}}static/logo.ico" />
</head>
<body>
<div id="root"></div>
<script>
  window.webRoot = "{{webRoot}}";
  window.csrf = "{{ ctx.csrf |  safe }}";
  localStorage.setItem('electricity-authority', "{{ authority }}");
  window.id = "{{ id }}";
  window.username = "{{ username }}";
</script>
<script type="text/javascript" src="{{webRoot}}static/index.js"> </script>
</body>
</html>