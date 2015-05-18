Planche
=========

"ExtJS" based MySQL GUI Client Tool

플란체는 ExtJS 기반의 MySQL Client 툴입니다. 현재는 개발중인 버전으로 실제 제대로 동작하지 않습니다.

또한 오픈 소스 운영은 처음 해보는 것이기 때문에 여러모로 표기해야 할 부분이나 그런것들이 미숙합니다. 부족한 내용은 지속적으로 채워 나갈 예정입니다.

현재 플란체를 가지고 "단순히" 할 수 있는 것들..
 

- 테이블 조회
- 컬럼 조회
- 쿼리 수행
- 프로시져 생성 
- 페이징
- 프로세스 리스트 확인
- 쿼리 Alignment

해당 프로젝트는 다음의 자바스크립트 프레임워크를 포함하여 개발 되었습니다.

- [CodeMirror] - Javascript 기반의 Editor
- [Sencha ExtJS 4.2] - 컴포넌트기반의 자바스크립 웹앱 프레임워크


Quick Start
----

```
1. Download planche-master.zip
2. Upload "app/planche_tnl.php" file on your web server
3. Open app/config-host.js
4. Add your host tunnling file was uploaded

php tunnling file
"resources/tunneling/php/planche_tnl.php" 

You must upload the file.

nodejs tunnling file
"resources/tunneling/nodejs/planche_tnl.js" 

You must upload the file.
Run 
```

Watch the video
----

http://www.youtube.com/embed/WCnXJXDRlYs

License
----

GPL v3

[CodeMirror]:http://codemirror.net/
[Sencha ExtJS 4.2]:http://www.sencha.com/products/extjs/