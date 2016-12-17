# Planche

![Planche Preview](http://plancheproject.github.io/images/intro2.png)

Planche is a MySQL GUI Climent tool. It was developed by javascript. You can use it through the tunneling.

It has the goal of implementing that is to be like a native application as closely as possible.

Extjs framework is used for the reaonses mentioned above. Extjs is the best way for it.

- [CodeMirror](http://codemirror.net/)
- [Sencha ExtJS 4.2](http://www.sencha.com/products/extjs/)

![Planche Preview](http://plancheproject.github.io/images/intro.png)

## Install

```
$ git clone https://github.com/plancheproject/planche.git
$ bower install
$ npm install
```

## Run tunneling server

```
$ npm run php [localhost] [port]
$ npm run node [localhost] [port]
```

플란체는 자바스크립트 기반이므로 데이터베이스에 접근할 수 있는 별도의 Client API가 존재하지 않습니다. 그래서 서버사이드 언어를 이용한 터널링 방식을 사용합니다.

![Planche Preview](http://plancheproject.github.io/images/arch1.png)

HTTP 터널링(Tunneling) 방식을 적용하여 터널링 파일만 올라가 있으면 내부(로컬)접속만 가능한 데이터베이스도 웹 서버에 설치된  터널링 파일을 통해 우회적인 접근이 가능합니다. Ajax 데이터 통신기술과 JSOP라는 방법을 선택적으로 사용하여 서버에 설치해 사용하거나 사용자의 PC에서 바로 실행하더라도 구동되도록 JSONP 통신방식을 채택하여 크로스 도메인 이슈에서도 벗어 날 수 있는 있도록 제작하였습니다.

![Planche Preview](http://plancheproject.github.io/images/arch2.png)

![Planche Preview](http://plancheproject.github.io/images/tunneling.png)

## Build and Run

- For web version
```
$ npm run start
```

- For desktop version
```
$ npm run desktop
```

- For wordpress version
```
$ npm run wordpress
```

- For chrome extension version
```
$ npm run chrome
```

## Configuration host(only web version)

```
$ vi dist/planche/resources/config/host.js
```

```javascript
Planche.config = {
    hosts : [
        {
            hostName    : 'My Host',
            tunnelingURL: 'http://localhost:8888',
            requestType : 'jsonp',
            host        : 'localhost',
            user        : 'user',
            pass        : 'password',
            charset     : 'utf8',
            port        : 3306,
            dbms        : 'mysql'
        }
    ]
}
```

## Demo

- [Planche Demo](http://www.planche.io/demo)

## Watch the video

http://www.youtube.com/embed/WCnXJXDRlYs

## Official Website

http://plancheproject.github.io

## License

This content is released under the GPL v3
