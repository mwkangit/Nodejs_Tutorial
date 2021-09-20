var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body){
  return `
<!doctype html>
<html>
<head>
  <title>WEB1 - ${title}</title>
  <meta charset="utf-8">
</head>
<body>
  <h1><a href="/">WEB</a></h1>
  ${list}
  <a href="/create">create</a>
  ${body}
</body>
</html>
  `;
}

function templateList(filelist){
  var list = '<ul>';

  var i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }

  list = list + '</ul>';

  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url; // request.url을 통해 현재 client가 http로 전송한 string query를 확인할 수 있다.
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url, true).pathname;
    console.log(pathName);
    /*if(_url == '/'){
      // _url = '/index.html';
      title = 'Welcome';
    }
    if(_url == '/favicon.ico'){
      response.writeHead(404);
      response.end();
      return;
    }*/

    if(pathName === '/'){ // path가 root인  즉 없는 경로로 들어왔다면 // 현재 /?으로 지정했으므로 pathname은 항상 / 이다
      if(queryData.id === undefined){ //  id 없으므로 그냥 root라는 뜻이다
        // fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){ // 읽을 파일이 없어도 실행이 된다. if  err, description이 없어서 그런걸로 판단된다.

          fs.readdir('./data', function(err, filelist){

            var title = 'Welcome';
            var description = 'Hello, Node.js';
            /*
            var list = `<ul>
                          <li><a href="/?id=HTML">HTML</a></li>
                          <li><a href="/?id=CSS">CSS</a></li>
                          <li><a href="/?id=JavaScript">JavaScript</a></li>
                        </ul>`
            */ // 이 내용을 프로그래밍적으로 만들어야 한다

            list = templateList(filelist);

            var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
            response.writeHead(200);
            response.end(template); // client에서 보내는 query string 으로 명령을 새로 만들 수 있다.
          });


      // });
    } else {

      fs.readdir('./data', function(err, filelist){

        /*
        var list = `<ul>
                      <li><a href="/?id=HTML">HTML</a></li>
                      <li><a href="/?id=CSS">CSS</a></li>
                      <li><a href="/?id=JavaScript">JavaScript</a></li>
                    </ul>`
        */ // 이 내용을 프로그래밍적으로 만들어야 한다

        list = templateList(filelist);

        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
          response.writeHead(200);
          response.end(template); // client에서 보내는 query string 으로 명령을 새로 만들 수 있다.
        });
      });
    }
  } else if(pathName === '/create'){
    fs.readdir('./data', function(err, filelist){

      var title = 'WEB - create';
      var description = 'Hello, Node.js';
      list = templateList(filelist);

      var template = templateHTML(title, list, `
        <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="title" placeholder="tltle"></p>

        <p><textarea name="description" placeholder="description"></textarea></p>

        <p><input type="submit"></p>
        </form>
        `);
      response.writeHead(200);
      response.end(template); // client에서 보내는 query string 으로 명령을 새로 만들 수 있다.
    });
  } else if(pathName === '/create_process'){
    var body = '';

    // 브라우저에서 post방식으로 데이터를 아주 많이 전송할 때를 대비하는 코드이다
    // 데이터를 조각낸 것을 수신한는 코드로 서버는 수신할 때마다 이 callback 함수를 호출하고 조각은 data 변수로 들어온다
    request.on('data', function(data){
      body = body + data;
      //데이터 양이 너무 많으면 연결을 끊는 코드
      // if (body.length > 1e6)
      //   request.connection.destroy();
    });

    // 모든 데이터가 들어온 후 이 callback함수가 실행된다
    request.on('end', function(){
      // post변수에 post해서 가져온 데이터를 넣는다
      // post변수에 post 정보가 들어있을 것이다
      // 데이터를 객체화 하는 것이다
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      })
    });
    // data와 end 같은 것들을 이벤트라고 한다

  } else { // 루트 경로 아닌 것은 에러 표시한다.
      response.writeHead(404);
      response.end('Not found');
    }



    console.log(pathName);
    console.log(__dirname + _url);
    console.log(queryData);
    // response.end(fs.readFileSync(__dirname + _url)); // 읽어들여야 하는 파일을 만들고 파일로부터 읽게 한다. Response.end 안에 위치해서 그 주소로가게한다. 사용자에게 전송하는 데이터를 바꿀수 있다. 아파치 못하고 나머지는 가능. 즉, 프로그래밍적으로 사용자에게 전송할 데이터를 생성한다.


});
app.listen(3000);