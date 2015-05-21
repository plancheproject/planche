<?php
define('DEBUG', true);

if (DEBUG == true) {

    error_reporting(E_ALL);
} else {

    error_reporting(0);
}

$sAddr = "localhost";
$nPort = 8888;

set_time_limit(0);

$isCLI = php_sapi_name() == "cli";

if (!function_exists('debug')) {
    function debug($msg)
    {

        $fp = fopen("tunnel.log", "a");
        if ($fp == false) {

            return;
        }
        fwrite($fp, "[".date("Y-m-d H:i:s")."]".$msg." \r\n");
        fclose($fp);
    }
}

if (!function_exists('http_parse_headers')) {
    function http_parse_headers($raw_headers)
    {
        $headers = array();
        $key     = ''; // [+]

        foreach (explode("\n", $raw_headers) as $i => $h) {
            $pos = strpos($h, "GET");

            if ($pos > -1) {

                $get = trim(substr($h, $pos + 3));
                $get = explode(" ", $get);

                $pos = strpos($get[0], "?");

                if ($pos === false) {

                    $headers['URL'] = $get[0];
                    continue;
                }

                $headers['URL'] = substr($get[0], 0, $pos);
                parse_str(substr($get[0], $pos + 1), $headers['GET']);
                continue;
            }

            $pos = strpos($h, ":");

            $headers[substr($h, 0, $pos)] = trim(substr($h, $pos + 2));
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

                writeResponse("Content-Type: application/json \r\n\r\n", $this->client);
            }
        } else {

            if ($this->callback) {

                header('Content-Type: application/javascript');

            } else {

                header('Content-Type: application/json');
            }
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

    public function query($query = null)
    {
        if (!$query) {

            $this->error('query was empty');

            return;
        }

        $start     = substr(microtime(), 0, 10);
        $result    = $this->conn->query($query);
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

                if (preg_match("/([^a-zA-Z0-9_$#])+/", $row->name, $matches)) {

                    $name = "tmp".$idx;
                } else {

                    $name = $row->name;
                }

                array_push($this->fields, array(
                    'name'       => $name,
                    'type'       => $this->types[$row->type],
                    'table'      => $row->table,
                    'max_length' => $row->max_length
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

                writeResponse(json_encode(array_map(array($this, 'removeHTML'), array_values($row))), $this->client);
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

    public function removeHTML($value)
    {

        $this->field_idx++;

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

    public function export()
    {

    }
}

$Planche = new Control();

if ($isCLI) {

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

    while (true) {

        $client = socket_accept($sock);

        if ($client === false) {

            usleep(100);

        } else if ($client > 0) {

            $Planche->setClient($client);

            socket_getpeername($client, $sClientIp, $nClientPort);

            $sRequestHeader = socket_read($client, 1024);

            $aHeaders = http_parse_headers($sRequestHeader);

            if ($aHeaders['URL'] == '/favicon.ico') {

                socket_close($client);
                continue;
            }

            if (isset($aHeaders['GET']) === false) {

                $Planche->error('Invalid request');
                socket_close($client);
                continue;
            }

            extract($aHeaders['GET']);

            echo "Execute Query\n";

            if ($callback) {

                echo "JSON Callback : $callback\n";
                $Planche->setCallback($callback);
            }

            echo "Connect $host, $user, **************, $db\n";
            if ($Planche->connect($host, $user, $pass, $db)) {

                echo "Connection Successful\n";

                echo "The execution SQL is\n";

                echo $query."\n";

                $Planche->setCharset($charset);
                $Planche->query($query);

                echo "-----------------------------------------------------------------------\n";
            }
            else {

                echo "ERROR : CONNECTION FAILED $host, $user, $pass, $db\n";
                echo "-----------------------------------------------------------------------\n";
            }

            socket_close($client);
        }
    }

} else {

    extract($_GET);

    if ($callback) $Planche->setCallback($callback);

    $Planche->connect($host, $user, $pass, $db);
    $Planche->setCharset($charset);
    $Planche->query($query);
}
?>