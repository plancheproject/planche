# Planche

![Planche Preview](http://planche.io/images/intro2.png)

Planche is a MySQL GUI Client tool. I had a goal that will be like a native application as closely as possible.
It uses Extjs framework for the some reasons. I thought that extjs is the best way for implementing the planche when I have write a first code, but nowaday we have many ways and skills for it. 

- [CodeMirror](http://codemirror.net/)
- [Sencha ExtJS 4.2](http://www.sencha.com/products/extjs/)

![Planche Preview](images/screenshot01.jpg?raw=true)

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

Planche is made by javascript using extjs and node. The planche recognize multiple query in own SQL editor for each execution.
I have been tested many mysql queries but I can't sure that planche is able to execute the SQL correctly in whole mysql versions.
It has the only way to communicate with mysql which called "tunneling". It works on ajax or jsonp that you can choose.
You can choice the running method by npm command which is in package.json

![Planche Preview](images/screenshot02.jpg?raw=true)

![Planche Preview](images/screenshot03.jpg?raw=true)

## Build and Run

- For web version
```
$ npm run start
```

- For desktop version
```
$ npm run desktop(it's not working pretty now, but I will check it up)
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
## author

Juwon <2jw0718@gmail.com>

## Demo

- [Planche Demo](http://www.planche.io/demo)

## Watch the video

http://www.youtube.com/embed/WCnXJXDRlYs

## Official Website

http://planche.io

## License

This content is released under the GPL v3 that inherited from extjs 4 license.
