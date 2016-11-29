<?php

class PlancheWPDB extends wpdb
{
    public $selectQuery = false;

    public function __construct($host, $user, $pass, $db)
    {
        parent::__construct($user, $pass, $db, $host);
    }

    public function print_error( $str = '' ) {

    }

    function isSelectQuery($query){

        preg_match( '/^(INSERT|DELETE|UPDATE|REPLACE|GRANT)/is', trim($query), $maybe );

        if( $maybe ){

            $this->selectQuery = false;
        }
        else {

            $this->selectQuery = true;
        }

        return $this->selectQuery;
    }
}
