<?php 
class Control {

    public $conn;

    public function __construct(){

    }

    public function connect($host, $user, $pass, $db){

        $conn = new mysqli($host, $user, $pass, $db);
    }

    public function sendHeader(){

        if (JSONP) {

            header('Content-Type: text/javascript');
            
        } else {

            header('Content-Type: application/x-json');
        }
    }

    public function setCharset($charset){

        if (empty($charset) === true){

            return;
        }

        $query = 'SET NAMES ' . $charset;
        $this->query($query);
    }

    public function error($error){

        $this->output(array (
            'success' => false,
            'message' => $error
        ));
    }

    public function query($query = null){

        if(!$query){

            $this->error('query was empty');
        }
    }

    public function output($output){

        $this->sendHeader();

        print json_encode($output);
        
        // affected_rows :
        // is_result_query : 
        // insert_id
        // field_count
        // fields
        // printf("Name:     %s\n", $finfo->name);
        // printf("Table:    %s\n", $finfo->table);
        // printf("max. Len: %d\n", $finfo->max_length);
        // printf("Flags:    %d\n", $finfo->flags);
        // printf("Type:     %d\n", $finfo->type);
        // records
    }

    static function debug($msg){

        $fp = fopen ("tunnel.log", "a");
        if($fp == false){

            return;
        }
        fwrite($fp, "[".date("Y-m-d H:i:s")."]".$msg." \r\n" );
        fclose($fp);
    }
}

extract($_GET);

define('DEBUG', false);
define('JSONP', (bool)isset($callback));

if(DEBUG == true) {

    error_reporting(E_ALL);
}
else {

    error_reporting(0);
}

set_time_limit(0);

$Planche = new Control();
$Planche->connect($host, $user, $pass, $db);
$Planche->query($query);
?>