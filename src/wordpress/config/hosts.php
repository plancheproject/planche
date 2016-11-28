<?php

$dirname = dirname(dirname(dirname(dirname(dirname(__FILE__)))));

/** Sets up the WordPress Environment. */
require( $dirname. '/wp-load.php' );

$user_id = get_current_user_id();
$option = 'planche-config-'.$user_id;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

  case 'GET':

  $isAJAX = false;

  if(isset($_GET['ajax']) && $_GET['ajax'] == true) {
  	/* special ajax here */
  	$isAJAX = true;
  }

  if($isAJAX){

    header('Content-Type: application/json');
  }
  else {

    header('Content-Type: application/javascript');
  }

    if (is_user_logged_in()) {

        $config = json_decode(get_option( $option ));
    }

    $hosts = isset($config->hosts) === true ? $config->hosts : array();
    $noIndexing = isset($config->noIndexing) === true ? $config->noIndexing : array();

    if(isset($config->autoLoadConnectionWindow) === true){

        $autoLoadConnectionWindow = $config->autoLoadConnectionWindow == 'true' || $config->autoLoadConnectionWindow == '1' ? true: false ;
    }
    else {

      $autoLoadConnectionWindow = false;
    }

    if($isAJAX){

      echo json_encode(array(
          'success' => true,
          'hosts' => $hosts,
          'noIndexing' => $noIndexing,
          'autoLoadConnectionWindow' => $autoLoadConnectionWindow
      ));
    }
    else {

      ?>
      var Planche = Planche || {};
      Planche.config = {
          hosts : <?php echo json_encode($hosts)?>,
          noIndexing : <?php echo json_encode($noIndexing)?>,
          autoLoadConnectionWindow: <?php echo $autoLoadConnectionWindow ? "true" : "false"?>
      };
      <?php
    }

    break;

  case 'POST':

    header('Content-Type: application/json');

    if (!is_user_logged_in()) {

        echo json_encode(array(
            'success' => false,
            'message' => 'Please login by admin account'
        ));

        exit;
    }

    $hosts = $_POST['hosts'];

    $config = json_decode(get_option( $option ));
    $config->hosts = json_decode(stripslashes($hosts));

    update_option( $option, json_encode($config) );

    echo json_encode(array(
        'success' => true,
        'message' => ''
    ));

    break;
}
