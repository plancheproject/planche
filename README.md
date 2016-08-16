# Planche

![planche logo](http://plancheproject.github.io/images/logo.jpeg)

플란체는 자바스크립트 기반의 MySQL GUI 클라이언트 툴입니다. HTTP터널링 방식을 통해 동작합니다. 플란체는 기본적인 설치형 유료 MySQL 클라이언트 도구를 웹에서 가능한 비슷하게 구현하자는 목표를 담았습니다.
웹상에서 설치형 클라이언트 도구의 모습을 흉내 내기위해 Sencha ExtJS Framework를 활용했습니다.

- [CodeMirror](http://codemirror.net/)
- [Sencha ExtJS 4.2](http://www.sencha.com/products/extjs/)

![Planche Preview](http://plancheproject.github.io/images/intro.png)

## 실행 환경

1. PHP 또는 nodejs 개발 환경이 필요합니다.
2. 별도의 웹서버가 꼭 필요한건 아닙니다(구성에 따른 옵션)

## 시작하기

1. 플란체를 다운로드 합니다.
2. 압축을 해제합니다.
3. 압축을 푼 디렉토리로 이동하여 터널링 서버를 실행합니다.

    - PHP를 이용한 터널링
    ```
    [mypc:planche-master myaccount]$ ./planche php [localhost] [port]
    ```

    - 노드를 이용한 터널링
    ```
    [mypc:planche-master myaccount]$ ./planche nodejs [localhost] [port]
    ```
    ![Planche Preview](http://plancheproject.github.io/images/tunneling.png)

5. index.html 클릭하여 실행합니다.
```
[mypc:planche-master myaccount]$ open build/index.html
```

## Configure host information

접속하자고자 하는 호스트 정보를 "build/resources/config/host.js" 파일에 JSON형식으로 추가합니다. 아래의 방법이 아니더라도 로컬스토리지에 저장이 가능하지만 권장하진 않습니다.

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

## HTTP 터널링(Tunneling)

플란체는 자바스크립트 기반이므로 데이터베이스에 접근할 수 있는 별도의 Client API가 존재하지 않습니다. 그래서 서버사이드 언어를 이용한 터널링 방식을 사용합니다.

![Planche Preview](http://plancheproject.github.io/images/arch1.png)

HTTP 터널링(Tunneling) 방식을 적용하여 터널링 파일만 올라가 있으면 내부(로컬)접속만 가능한 데이터베이스도 웹 서버에 설치된  터널링 파일을 통해 우회적인 접근이 가능합니다. Ajax 데이터 통신기술과 JSOP라는 방법을 선택적으로 사용하여 서버에 설치해 사용하거나 사용자의 PC에서 바로 실행하더라도 구동되도록 JSONP 통신방식을 채택하여 크로스 도메인 이슈에서도 벗어 날 수 있는 있도록 제작하였습니다.

![Planche Preview](http://plancheproject.github.io/images/arch2.png)


## 데모영상

- [Planche Demo](http://www.planche.io/demo)

## 플란체를 사용하는 다른 프로젝트들

- [Planche desktop](http://github.com/plancheproject/planche-desktop) : 일렉트론 패키징을 통해 데스크탑용 버전으로 개발하려 합니다.
- [Planche wordpress](http://github.com/plancheproject/planche-wp) : 워드프레스용 플러그인 패키지입니다.


![Planche Preview](http://plancheproject.github.io/images/intro2.png)

## Watch the video

http://www.youtube.com/embed/WCnXJXDRlYs

## Official Website

http://plancheproject.github.io

## License

This content is released under the GPL v3
