<?php

class PlancheWPDB extends wpdb
{
    public $selectQuery = false;

    public function __construct($host, $user, $pass, $db)
    {
        parent::__construct($user, $pass, $db, $host);
    }

    function isSelectQuery($query){

        preg_match( '/INSERT|DELETE|UPDATE|REPLACE|GRANT/is', $query, $maybe );

        if( $maybe ){

            $this->selectQuery = false;
        }
        else {

            $this->selectQuery = true;
        }

        return $this->selectQuery;
    }
}
