<?php 
class Control {

    public $conn;
    private $types = array();
    private $callback = null;

    public function __construct(){

        $this->loadDataTypes();
    }

    public function connect($host, $user, $pass, $db){

        $this->conn = new mysqli($host, $user, $pass, $db);
    }

    public function sendHeader(){

        if (JSONP) {

            header('Content-Type: application/javascript');
            
        } else {

            header('Content-Type: application/json');
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

    public function setCallback($callback){

        $this->callback = $callback;
    }

    public function loadDataTypes(){

        $constants = get_defined_constants(true);
        foreach($constants['mysqli'] as $idx => $val){

            $prefix = substr($idx, 0, 11);
            if($prefix == 'MYSQLI_TYPE'){

                $this->types[$val] = strtolower(substr($idx, 12));
            }
        }
    }

    public function query($query = null){


        if(!$query){

            $this->error('query was empty');
            return;
        }

        $start = substr(microtime(), 0, 10);
        $result = $this->conn->query($query);
        $end = substr(microtime(), 0, 10);
        $exec_time = substr($end - $start, 0, 10);

        if ($this->conn->error) {

            $this->error($this->conn->error);
            return;
        }

        $this->sendHeader();

        $this->fields = array();

        if ($this->callback !== null) {

            echo $this->callback.'(';
        }

        $start = substr(microtime(), 0, 10);

        echo '{success:true,';
        echo 'exec_time:'.$exec_time.',';
        $affected_rows = $this->conn->affected_rows;
        echo 'affected_rows:'.$affected_rows.',';

        $insert_id = $this->conn->insert_id;
        echo 'insert_id:'.$insert_id.',';

        if(method_exists($result, 'fetch_fields')){

            $fields = $result->fetch_fields();
            foreach($fields as $idx => $row){
                
                array_push($this->fields, array(
                    'name' => $row->name,
                    'type' => $this->types[$row->type],
                    'table' => $row->table,
                    'max_length' => $row->max_length
                ));
            }

            $is_result_query = true;
        }
        else {

            $is_result_query = false;
        }

        echo 'fields:'.json_encode($this->fields).',';      

        echo "records:[";

        if(method_exists($result, 'fetch_array')){

            $idx = 0;
            while ($row = $result->fetch_array(MYSQLI_ASSOC))
            {
                $this->field_idx = 0;

                if($idx > 0){ 
                    
                    echo ",";
                }
                echo json_encode(array_map(array($this, 'removeHTML'), array_values($row)));
                $idx++;
            }
        }
        
        echo "],";

        echo 'is_result_query:'.($is_result_query ? 'true':'false').",";

        $end = substr(microtime(), 0, 10);
        $transfer_time = substr($end - $start, 0, 10);

        echo 'transfer_time:'.$transfer_time.',';

        $total_time = $exec_time + $transfer_time;
        
        echo 'total_time:'.$total_time;
        echo "}";

        if($this->callback !== null){

            echo ');';
        }
    }

    public function removeHTML($value){

        if(in_array($this->fields[$this->field_idx]['type'], array('blob', 'var_string'))){

            $this->field_idx++;
            return htmlspecialchars($value);            
        }
        else {

            $this->field_idx++;
            return $value;
        }
    }

    public function output($output){

        $this->sendHeader();

        if ($this->callback !== null) {

            echo $this->callback.'(';
        }

        echo json_encode($output);

        if ($this->callback !== null) {

            echo ');';
        }

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

define('DEBUG', true);
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
if(JSONP) $Planche->setCallback($callback);
$Planche->query($query);
?>