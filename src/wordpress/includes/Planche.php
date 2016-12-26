<?php

class Planche
{
    public  $conn;
    private $types    = array();
    private $callback = null;

    public function __construct()
    {
        $this->loadDataTypes();
    }

    public function sendHeader()
    {
        if ($this->callback) {

            header('Content-Type: application/javascript');

        } else {

            header('Content-Type: application/json');
        }
    }

    public function setDatabase($host, $user, $password, $db){

        $this->conn = new PlancheWPDB($host, $user, $password, $db);
    }

    public function sendExportHeader($name)
    {

        header("Content-type: text/csv");
        header("Content-Disposition: attachment; filename=".$name.".csv");
        header("Pragma: no-cache");
        header("Expires: 0");
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
        return @$this->conn->query($query);
    }

    public function execute($query = null)
    {
        if (!$query) {

            $this->error('query was empty');

            return;
        }

        $start = substr(microtime(), 0, 10);
        $this->query($query);

        $end       = substr(microtime(), 0, 10);
        $exec_time = substr($end - $start, 0, 10);

        if ($this->conn->last_error) {

            $this->error($this->conn->last_error);

            return;
        }

        $this->sendHeader();

        $this->fields = array();

        if ($this->callback !== null) {

            echo($this->callback.'(');
        }

        $start = substr(microtime(), 0, 10);

        echo('{"success":true,');
        echo('"exec_time":'.$exec_time.',');
        $affected_rows = $this->conn->rows_affected;
        echo('"affected_rows":'.$affected_rows.',');

        $insert_id = $this->conn->insert_id;
        echo('"insert_id":'.$insert_id.',');

        if($this->conn->isSelectQuery($query)){

            if (count($this->conn->get_col_info()) > 0) {

                $fields = $this->conn->col_info;
                foreach ($fields as $idx => $row) {

                    $name = $row->name;

                    @array_push($this->fields, array(
                        'name'       => $name,
                        'type'       => $this->types[$row->type],
                        'table'      => $row->table,
                        'max_length' => $row->max_length
                    ));
                }
            }
        }

        echo('"fields":'.json_encode($this->fields).',');

        echo('"records":[');

        if (count($this->conn->last_result) > 0) {

            foreach ($this->conn->last_result as $idx => $row) {

                $this->field_idx = 0;

                if ($idx > 0) {

                    echo(",");
                }

                $colidx = 0;
                echo("[");
                foreach($row as $colname => $colval){

                    if ($colidx > 0) {

                        echo(",");
                    }

                    echo(json_encode($this->removeHTML($colval)));

                    $colidx++;
                }
                echo("]");
            }
        }

        echo("],");

        echo('"is_result_query":'.($this->conn->isSelectQuery($query) ? 'true' : 'false').",");

        $end           = substr(microtime(), 0, 10);
        $transfer_time = substr($end - $start, 0, 10);

        echo('"start":'.$start.',');
        echo('"end":'.$end.',');
        echo('"transfer_time":'.$transfer_time.',');

        $total_time = $exec_time + $transfer_time;

        echo('"total_time":'.$total_time);
        echo("}");

        if ($this->callback !== null) {

            echo(');');
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

            echo($this->callback.'(');
        }

        echo(json_encode($output));

        if ($this->callback !== null) {

            echo(');');
        }

    }

    public function export($query = null, $csv)
    {
        if (!$query) {

            $this->error('query was empty');

            return;
        }

        if ($this->conn->error) {

            $this->error($this->conn->error);

            return;
        }

        $csv .= '_'.uniqid();

        $this->query($query);

        $this->sendExportHeader($csv);

        $fields = $this->conn->get_col_info();

        if (count($fields) === 0) {

            $this->error('query was not selectable');

            return;
        }

        if (!$this->conn->isSelectQuery($query)) {

            $this->error('query was not selectable');

            return;
        }

        foreach ($fields as $idx => $field) {

            if ($idx > 0) {

                echo(",");
            }

            echo($field);
        }

        if ($fields) {

            echo("\n");
        }

        foreach ($this->conn->last_result as $idx => $row) {

            $fidx = 0;
            foreach ($row as $field => $val) {

                if ($fidx > 0) {

                    echo(",");
                }

                echo('"'.$val.'"');

                $fidx++;
            }

            echo("\n");
        }
    }

    public function bookmark($sql)
    {
        $this->sendHeader();

        if (!trim($sql)) {

            $this->error('The SQL was empty');

            return;
        }

        $bookmark = array(
            'post_title'   => 'bookmark',
            'post_content' => $sql,
            'post_type'    => 'Bookmark SQL',
            'post_status'  => 'private'
        );

        wp_insert_post($bookmark);

        $this->output(array(
            'success' => true,
            'message' => 'Bookmark completed.'
        ));
    }

    public function loadBookmark()
    {
        $this->sendHeader();

        $type = 'Bookmark SQL';
        
        $args = array(
            'post_type'        => $type,
            'post_status'      => 'private',
            'posts_per_page'   => -1,
            'caller_get_posts' => 1
        );

        $my_query = new WP_Query($args);

        echo('{"success":true,');
        echo('"bookmark":[');

        if ($my_query->have_posts()) {

            $idx = 0;
            while ($my_query->have_posts()) {

                $my_query->the_post();

                if($idx > 0){

                    echo(',');
                }

                echo('{"title":');
                echo json_encode(get_the_title());
                echo(',');
                echo('"content":');
                echo json_encode(get_the_content());
                echo('}');

                $idx++;
            }
        }

        wp_reset_query();  // Restore global post data stomped by the_post().

        echo("]");
        echo("}");
    }
}
