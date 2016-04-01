<?php
set_time_limit(0);

define('DEBUG', true);

if (DEBUG == true) {

    error_reporting(E_ALL);
} else {

    error_reporting(0);
}

$isCLI = php_sapi_name() == "cli";

if (!function_exists('debug')) {

    function debug($msg)
    {

        $fp = fopen("tunnel.log", "a");
        if ($fp == false) {

            return;
        }
        echo("[".date("Y-m-d H:i:s")."]".$msg." \r\n");
        fclose($fp);
    }
}

if (!function_exists('http_parse_headers')) {

    function http_parse_headers($raw_headers, $method = 'GET')
    {
        $headers = array();

        if ($method == 'GET') {

            $pos = strpos($raw_headers, $method);

            if ($pos === false) {

                return $headers;
            }

            $pos += strlen($method) + 1;
            $body = substr($raw_headers, $pos);
            $body = trim(substr($body, 0, strpos($body, " ")));

            if (strlen($body) === 0) {

                return $headers;
            }

            $headers['URL'] = parse_url($body, PHP_URL_PATH);
            parse_str(parse_url($body, PHP_URL_QUERY), $headers['PARAMS']);

        } else if ($method == 'POST') {

            $pos = strpos($raw_headers, $method);

            if ($pos === false) {

                return $headers;
            }

            $pos += strlen($method) + 1;
            $body = substr($raw_headers, $pos);
            $body = trim(substr($body, 0, strpos($body, " ")));

            if (strlen($body) === 0) {

                return $headers;
            }

            $headers['URL'] = parse_url($body, PHP_URL_PATH);

            $param = trim(substr($raw_headers, strpos($raw_headers, "\r\n\r\n")));

            if ($param) {

                parse_str($param, $headers['PARAMS']);
            }
        }

        return $headers;
    }
}

if (!function_exists('writeResponse')) {

    function writeResponse($string, $client = null)
    {
        if ($client) {

            socket_write($client, $string, strlen($string));

        } else {

            echo $string;
        }
    }
}

if (!function_exists('generateRSAKey')) {

    function generateRSAKey()
    {
        $config = array(
            "private_key_bits" => 1024,
            "private_key_type" => OPENSSL_KEYTYPE_RSA
        );

        // Create the private and public key
        $res = openssl_pkey_new($config);

        // Extract the private key from $res to $privKey
        openssl_pkey_export($res, $privKey);

        // Extract the public key from $res to $pubKey
        $pubKey = openssl_pkey_get_details($res);
        $pubKey = $pubKey["key"];

        return array(
            'privKey' => $privKey,
            'pubKey'  => $pubKey
        );
    }
}

if (!function_exists('descriptData')) {

    function descriptData($encrypted, $privKey)
    {

        openssl_private_decrypt($encrypted, $decrypted, $privKey);

        return $decrypted;
    }
}

class Control
{

    public  $conn;
    private $types    = array();
    private $callback = null;
    private $client   = null;

    public function __construct()
    {

        $this->loadDataTypes();
    }

    public function connect($host, $user, $pass, $db)
    {
        $this->conn = @new mysqli($host, $user, $pass, $db);

        if ($this->conn->connect_error) {

            $this->error('Connect Error ('.$this->conn->connect_errno.') '.$this->conn->connect_error);

            return false;
        }

        return true;
    }

    public function close()
    {

        $this->conn->close();
    }

    public function setClient($client)
    {

        $this->client = $client;
    }

    public function sendHeader()
    {

        if ($this->client) {

            writeResponse("HTTP/1.1 200 OK \r\n", $this->client);
            writeResponse("Date: Fri, 31 Dec 1999 23:59:59 GMT \r\n", $this->client);

            if ($this->callback) {

                writeResponse("Content-Type: application/javascript \r\n\r\n", $this->client);

            } else {

                writeResponse("Access-Control-Allow-Origin: * \r\n", $this->client);
                writeResponse("Content-Type: application/json \r\n\r\n", $this->client);
            }
        } else {

            if ($this->callback) {

                header('Content-Type: application/javascript');

            } else {

                header('Access-Control-Allow-Origin: *');
                header('Content-Type: application/json');
            }
        }
    }

    public function sendExportHeader($name)
    {

        if ($this->client) {

            writeResponse("HTTP/1.1 200 OK \r\n", $this->client);
            writeResponse("Date: Fri, 31 Dec 1999 23:59:59 GMT \r\n", $this->client);

            writeResponse("Content-type: text/csv \r\n", $this->client);
            writeResponse("Content-Disposition: attachment; filename=".$name.".csv \r\n", $this->client);
            writeResponse("Pragma: no-cache \r\n", $this->client);
            writeResponse("Expires: 0 \r\n\r\n", $this->client);

        } else {

            header("Content-type: text/csv");
            header("Content-Disposition: attachment; filename=".$name.".csv");
            header("Pragma: no-cache");
            header("Expires: 0");
        }
    }

    public function setCharset($charset)
    {

        if (empty($charset) === true) {

            return;
        }

        $query = 'SET NAMES '.$charset;
        $this->conn->query($query);
    }

    public function error($error)
    {

        $this->output(array(
            'success' => false,
            'message' => $error
        ));
    }

    public function setCallback($callback)
    {

        $this->callback = $callback;
    }

    public function loadDataTypes()
    {

        $constants = get_defined_constants(true);
        foreach ($constants['mysqli'] as $idx => $val) {

            $prefix = substr($idx, 0, 11);
            if ($prefix == 'MYSQLI_TYPE') {

                $this->types[$val] = strtolower(substr($idx, 12));
            }
        }
    }

    public function query($query)
    {

        return $this->conn->query($query);
    }

    public function execute($query = null)
    {
        if (!$query) {

            $this->error('query was empty');

            return;
        }

        $start     = substr(microtime(), 0, 10);
        $result    = $this->query($query);
        $end       = substr(microtime(), 0, 10);
        $exec_time = substr($end - $start, 0, 10);

        if ($this->conn->error) {

            $this->error($this->conn->error);

            return;
        }

        $this->sendHeader();

        $this->fields = array();

        if ($this->callback !== null) {

            writeResponse($this->callback.'(', $this->client);
        }

        $start = substr(microtime(), 0, 10);

        writeResponse('{"success":true,', $this->client);
        writeResponse('"exec_time":'.$exec_time.',', $this->client);
        $affected_rows = $this->conn->affected_rows;
        writeResponse('"affected_rows":'.$affected_rows.',', $this->client);

        $insert_id = $this->conn->insert_id;
        writeResponse('"insert_id":'.$insert_id.',', $this->client);

        if (method_exists($result, 'fetch_fields')) {

            $fields = $result->fetch_fields();
            foreach ($fields as $idx => $row) {

                $name = $row->name;

                array_push($this->fields, array(
                    'name'       => $name,
                    'org_name'   => $row->orgname,
                    'type'       => $this->types[$row->type],
                    'table'      => $row->table,
                    'org_table'  => $row->orgtable,
                    'default'    => $row->def,
                    'max_length' => $row->max_length,
                    'length'     => $row->length
                ));
            }

            $is_result_query = true;
        } else {

            $is_result_query = false;
        }

        writeResponse('"fields":'.json_encode($this->fields).',', $this->client);

        writeResponse('"records":[', $this->client);

        if (method_exists($result, 'fetch_array')) {

            $idx = 0;
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $this->field_idx = 0;

                if ($idx > 0) {

                    writeResponse(",", $this->client);
                }

                writeResponse(json_encode(array_map(array($this, 'pretreatment'), array_values($row))), $this->client);
                $idx++;
            }
        }

        writeResponse("],", $this->client);

        writeResponse('"is_result_query":'.($is_result_query ? 'true' : 'false').",", $this->client);

        $end           = substr(microtime(), 0, 10);
        $transfer_time = substr($end - $start, 0, 10);

        writeResponse('"transfer_time":'.$transfer_time.',', $this->client);

        $total_time = $exec_time + $transfer_time;

        writeResponse('"total_time":'.$total_time, $this->client);
        writeResponse("}", $this->client);

        if ($this->callback !== null) {

            writeResponse(');', $this->client);
        }
    }

    public function pretreatment($value)
    {

        $this->field_idx++;

//        if(is_null($value) === true){
//
//            $value = '(NULL)';
//        }
//


        return $value;
    }

    public function output($output)
    {

        $this->sendHeader();

        if ($this->callback !== null) {

            writeResponse($this->callback.'(', $this->client);
        }

        writeResponse(json_encode($output), $this->client);

        if ($this->callback !== null) {

            writeResponse(');', $this->client);
        }

    }

    public function export($query = null)
    {
        if (!$query) {

            $this->error('query was empty');

            return;
        }

        if ($this->conn->error) {

            $this->error($this->conn->error);

            return;
        }

        $csv = uniqid();

        $result = $this->conn->query($query);

        $this->sendExportHeader($csv);

        if (!method_exists($result, 'fetch_fields')) {

            $this->error('query was not selectable');

            return;
        }

        if (!method_exists($result, 'fetch_array')) {

            $this->error('query was not selectable');

            return;
        }

        $fields = $result->fetch_fields();
        foreach ($fields as $idx => $row) {

            if ($idx > 0) {

                writeResponse(",", $this->client);
            }

            writeResponse($row->name, $this->client);
        }

        if ($fields) {

            writeResponse("\n", $this->client);
        }

        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {

            $idx = 0;
            foreach ($row as $field => $val) {

                if ($idx > 0) {

                    writeResponse(",", $this->client);
                }

                writeResponse('"'.$val.'"', $this->client);
                $idx++;
            }

            writeResponse("\n", $this->client);
        }
    }
}

$Planche = new Control();

if ($isCLI) {

    @$sAddr = $argv[1] ? $argv[1] : '127.0.0.1';
    @$nPort = $argv[2] ? $argv[2] : 8888;

    echo "-----------------------------------------------------------------------\n";
    echo "Start Planche Tunneling Server\n";

    $sock = socket_create(AF_INET, SOCK_STREAM, 0);
    if (!$sock) {

        echo "ERROR : Create socket failed.\n";
        exit;
    }

    socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, 1);
    $bResult = socket_bind($sock, $sAddr, $nPort);

    if (!$bResult) {

        echo "ERROR : Socket address was not bound. $sAddr:$nPort\n";
        exit;
    }

    echo "Mapping http://$sAddr:$nPort/ to ....\n";
    echo "-----------------------------------------------------------------------\n";
    echo "HTTP tunneling server is ready at : http://$sAddr:$nPort\n";
    echo "-----------------------------------------------------------------------\n";

    socket_listen($sock);

    echo "Wating query requests..\n";
    echo "-----------------------------------------------------------------------\n";

    while (true) {

        $client = socket_accept($sock);

        if ($client === false) {

            usleep(100);

        } else if ($client > 0) {

            $Planche->setClient($client);

            socket_getpeername($client, $sClientIp, $nClientPort);

            $sRequestHeader = socket_read($client, 10000);

            $GET  = http_parse_headers($sRequestHeader, 'GET');
            $POST = http_parse_headers($sRequestHeader, 'POST');

            $REQUEST = array_merge(
                $GET,
                $POST
            );

            if ($REQUEST['URL'] == '/favicon.ico') {

                socket_close($client);
                continue;
            }

            if (@$REQUEST['PARAMS']['callback']) {

                //echo "JSON Callback : ".$REQUEST['PARAMS']['callback']."\n";
                $Planche->setCallback($REQUEST['PARAMS']['callback']);
            }

            if (isset($REQUEST['PARAMS']) === false) {

                $Planche->error('Invalid request');
                socket_close($client);
                continue;
            }

            if (isset($REQUEST['PARAMS']['cmd']) === false) {

                $Planche->error('Invalid request');
                socket_close($client);
                continue;
            }

            extract(json_decode(base64_decode($REQUEST['PARAMS']['cmd']), true));

            echo "Execute Query\n";

            if (@!$db) {

                $db = '';
            }

            echo "Connect $host, $user, **************, $db\n";

            if ($Planche->connect($host, $user, $pass, $db)) {

                echo "Connection Successful\n";

                $Planche->setCharset($charset);

                echo "The execution SQL is\n";

                if ($type === 'export') {

                    if (is_array($query) == true) {

                        echo $query[0]."\n";
                        $Planche->export($query[0]);

                    } else {

                        echo $query."\n";
                        $Planche->export($query);
                    }

                } else {

                    if ($type == 'copy') {

                        $Planche->query("SET foreign_key_checks = 0");
                    }

                    echo $query."\n";
                    $Planche->execute($query);
                }

                $Planche->close();

                echo "-----------------------------------------------------------------------\n";
            } else {

                echo "ERROR : CONNECTION FAILED $host, $user, , **************, $db\n";
                echo "-----------------------------------------------------------------------\n";
            }

            socket_close($client);
        }
    }

} else {

    if (isset($_REQUEST['callback']) === true) {

        $Planche->setCallback($_REQUEST['callback']);
    }

    extract(json_decode(base64_decode($_REQUEST['cmd']), true));

    if (isset($_REQUEST['cmd']) === false) {

        $Planche->error('Invalid request');
        exit;
    }

    if (@$Planche->connect($host, $user, $pass, $db)) {

        @$Planche->setCharset($charset);

        if ($type === 'export') {

            if (is_array($query) == true) {

                $Planche->export($query[0], $csv);

            } else {

                $Planche->export($query, $csv);
            }

        } else {

            if ($type == 'copy') {

                $Planche->query("SET foreign_key_checks = 0");
            }

            $Planche->execute($query);
        }

        $Planche->close();
    }
}
?>