<?php

$dirname = dirname(dirname(dirname(dirname(dirname(__FILE__)))));

/** Sets up the WordPress Environment. */
require( $dirname. '/wp-load.php' );

$domains = trim(get_option('planche-cors'));
$domains = preg_replace("/[\r\n]+/", ", ", $domains);

if ($domains) {

    header('Access-Control-Allow-Origin: '.$domains);
}

header('Access-Control-Allow-Credentials: true');

require_once '../includes/Planche.php';
require_once '../includes/PlancheWPDB.php';

$Planche = new Planche();

if (isset($_REQUEST['callback']) === true) {

    $Planche->setCallback($_REQUEST['callback']);
}

if (!is_user_logged_in()) {

    $Planche->error('Please, login admin');
    exit;
}

if (isset($_REQUEST['cmd']) === false) {

    $Planche->error('Invalid request');
    exit;
}

$cmd = json_decode(base64_decode($_REQUEST['cmd']));

if(!$cmd->db){

    $db = DB_NAME;
}
else {

    $db = $cmd->db;
}

@$Planche->setDatabase($cmd->host, $cmd->user, $cmd->pass, $db);
@$Planche->conn->select($db);

// print_r($cmd->query);

if ($cmd->type === 'export') {

    if (is_array($cmd->query) == true) {

        @$Planche->export($cmd->query[0], $cmd->csv);
    }
    else {

        @$Planche->export($cmd->query, $cmd->csv);
    }
}
elseif ($cmd->type === 'bookmark') {

    @$Planche->bookmark($sql);
}
elseif ($cmd->type === 'loadBookmark') {

    @$Planche->loadBookmark();
}
else {

    if ($cmd->type == 'copy') {

        @$Planche->query('SET foreign_key_checks = 0');
    }

    @$Planche->execute($cmd->query);
}
?>
