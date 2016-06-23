# Planche

![planche logo](http://plancheproject.github.io/images/logo.jpeg)

Javascript MySQL GUI Client Tool

The Planche is MySQL GUI client tool. This tool has a flexible structure to use. Basically, the operation through the tunneling.
The current version is under development. So it may not work properly. The project has been developed, including the following JavaScript frameworks.

- [CodeMirror](http://codemirror.net/)
- [Sencha ExtJS 4.2](http://www.sencha.com/products/extjs/)

![Planche Preview](http://plancheproject.github.io/images/intro.png)

## Required environment

1. Need php or nodejs environment for execute tunneling file.
2. Apache Web Server(optional) -> Tunneling file has its own web server.

## Quick Run

1. Download planche-master.zip on your PC
2. Extract the zip file
```
[mypc:~ myaccount]$ unzip planche-master
```

3. Move into extracted folder then move into application directory.
```
[mypc:planche-master myaccount]$ cd planche-master
```

4. Run the "tunneling file" at CLI mode.
(Attention) When exposed  uploaded tunneling files. Security issues may arise. I hope you remember this problem for the database server.

    - PHP Environment
    ```
    [mypc:planche-master myaccount]$ ./planche php [localhost] [port]
    ```

    - nodeJS Environment
    ```
    [mypc:planche-master myaccount]$ ./planche nodejs [localhost] [port]
    ```

5. Finally open the planche index.html on your default browser.
(Yet recommend Chrome. I did not test other browsers. You can break your head.)
```
[mypc:planche-master myaccount]$ open build/index.html
```

## Configure host information

Add host's information on the "build/resources/config/host.js" file

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

## Current features

- Execute Query : like a desktop application
- Query Editor : like a desktop application
- Query Alignment : Yet it acts like a fool.
- Support delimiter
- Table schema view
- Auto query result paging(by limit)
- Create, Alter, Drop, Refresh Procedure
- Create, Alter, Drop, Refresh View
- Create, Alter, Drop, Refresh Function
- Create, Alter, Drop, Rename, Refresh Event
- Create, Alter, Drop, Rename, Refresh Trigger
- Create, Alter, Drop, Empty, Truncate, Refresh Database
- Create, Alter, Drop, Truncate, Refresh Table
- Query tokenize.
- Process Manager, Kill Process
- Schema Edit Window
- Show Variables Window
- Show Status Window
- Paste SQL Statement(Insert, Update, Delete, Select)

## Demo

- [Planche Demo](http://www.planche.io/demo)

## Other projects with planche
- [Planche desktop](http://github.com/plancheproject/planche-desktop)
- [Planche wordpress](http://github.com/plancheproject/planche-wp)


![Planche Preview](http://plancheproject.github.io/images/intro2.png)

## Watch the video

http://www.youtube.com/embed/WCnXJXDRlYs

## Official Website

http://plancheproject.github.io

## License

This content is released under the GPL v3
