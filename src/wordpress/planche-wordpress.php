<?php

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

/**
 * Plugin Name: Planche for wordPress
 * Plugin URI: https://github.com/plancheproject/planche/
 * Description: The MySQL GUI tool planche for wordpress
 * Version:  1.0.0
 * Author: Jeong Ju Won(2jw0718@gmail.com)
 * License:  GPLv2 or later
 */

define('PLANCHE_DEBUG', @file_get_contents(__DIR__."/.debug") == 'true');

add_action('init', 'planche_wp_post_type', 0);

add_action('admin_menu', 'planche_menu');
add_action('admin_menu', 'planche_cors_option');
// add_action('admin_menu', 'planche_settings');

add_action('wp_ajax_planche_wp_tunneling', 'planche_wp_tunneling');
add_action('wp_ajax_nopriv_planche_wp_tunneling', 'planche_wp_need_login');

add_filter('user_can_richedit', 'disable_wysiwyg_for_bookmark');

register_activation_hook( __FILE__, 'planche_activate' );

function disable_wysiwyg_for_bookmark($default) {

    global $post;
    if ('bookmarksql' == get_post_type($post))
        return false;
    return $default;
}

function planche_activate(){

    $user_id = get_current_user_id();
    $option = 'planche-config-'.$user_id;

    $config = get_option($option);

    if(!$config){

        $config = array();
        $config['autoLoadConnectionWindow'] = false;
        $config['hosts'] = array(array(
            "index"         => '0',
            "hostName"      => "This wordpress",
            "tunnelingURL"  => "tunneling/wordpress.php",
            "requestType"   => "jsonp",
            "host"          => DB_HOST,
            "user"          => DB_USER,
            "pass"          => DB_PASSWORD,
            "charset"       => DB_CHARSET,
            "db"            => DB_NAME,
            "port"          => "3306",
            "dbms"          => "mysql",
            "autoConnection"=> true
        ));

        $config['noIndexing'] = array(
            'information_schema',
            'performance_schema',
            'mysql'
        );

        add_option($option, json_encode($config));
    }
}

function register_mysettings()
{
    register_setting('planche-option-group', 'planche-cors');
    // register_setting('planche-option-group', 'planche-settings');
}

function planche_wp_need_login()
{
    require_once 'includes/Planche.php';
    require_once 'includes/PlancheWPDB.php';

    $Planche = new Planche();
    $Planche->error('You need to login as administrator.');

    exit;
}

function planche_menu()
{
    add_menu_page('Planche', 'Planche', 'manage_options', 'planche', 'planche_view', 'dashicons-list-view', 39);
}

function planche_cors_option()
{
    add_action('admin_init', 'register_mysettings');
    add_submenu_page('planche', 'Planche Cors Domain Setting', 'Cors Domain Setting', 'manage_options', 'planche-cors', 'planche_cors_setting_page');
}

function planche_settings()
{
    // add_action('admin_init', 'register_mysettings');
    add_submenu_page('planche', 'Planche Settings', 'Planche Settings', 'manage_options', 'planche-settings', 'planche_settings_page');
}

function planche_view()
{
    ?>
    <style>

        #planche-wp-container {

            padding:100px;
            text-align:center;
        }

    </style>
    <div id="planche-wp-container">
        <div id="planche-wp-intro" style="width: 100%;height: 100%">
            <div><img src="<?php echo plugin_dir_url(__FILE__)?>resources/images/logo.jpg"/></div>
            <div style="text-align:left;border:1px solid #000000;padding:10px;margin:20px">
                <h1>Your tunneling URL is : </h1>
                <h2><span class="dashicons dashicons-external"></span> Absolute</h2> <?php echo plugin_dir_url(__FILE__);?>tunneling/wordpress.php
                <h2><span class="dashicons dashicons-external"></span> Relative</h2> tunneling/wordpress.php
            </div>
            <div>
                <input type="button" id="btn-run-planche" class="button button-primary" value="Run planche"/>
            </div>
        </div>
    </div>
    <script>
    (function($) {

        $("#btn-run-planche").click(function(){

            var win = window.open('<?php echo plugin_dir_url(__FILE__)?>index.html', 'Planche', '_blacnk');
            win.focus();
        });

    })(jQuery);
    </script>
<?php

}

function planche_wp_post_type()
{
    $labels = array(
        'name'               => _x('Bookmark SQLs', 'Post Type General Name', 'text_domain'),
        'singular_name'      => _x('Bookmark SQL', 'Post Type Singular Name', 'text_domain'),
        'menu_name'          => __('Planche Bookmark', 'text_domain'),
        'name_admin_bar'     => __('Bookmark SQL', 'text_domain'),
        'parent_item_colon'  => __('Parent Item:', 'text_domain'),
        'all_items'          => __('All Bookmark SQLs', 'text_domain'),
        'add_new_item'       => __('Add New Bookmark SQL', 'text_domain'),
        'add_new'            => __('Add New', 'text_domain'),
        'new_item'           => __('New Bookmark SQL', 'text_domain'),
        'edit_item'          => __('Edit Bookmark SQL', 'text_domain'),
        'update_item'        => __('Update Bookmark SQL', 'text_domain'),
        'view_item'          => __('View Bookmark SQL', 'text_domain'),
        'search_items'       => __('Search Bookmark SQL', 'text_domain'),
        'not_found'          => __('Not found', 'text_domain'),
        'not_found_in_trash' => __('Not found in Trash', 'text_domain'),
    );

    $args = array(
        'label'               => __('Bookmark SQL', 'text_domain'),
        'description'         => __('Planche Bookmark SQL', 'text_domain'),
        'labels'              => $labels,
        'supports'            => array(),
        'taxonomies'          => array(),
        'hierarchical'        => false,
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_position'       => 40,
        'menu_icon'           => 'dashicons-star-empty',
        'show_in_admin_bar'   => true,
        'show_in_nav_menus'   => false,
        'can_export'          => true,
        'has_archive'         => true,
        'exclude_from_search' => false,
        'publicly_queryable'  => true,
        'capability_type'     => 'page',
    );

    register_post_type('Bookmark SQL', $args);
}

/** Render the settings / options page in the admin dashboard */
function planche_cors_setting_page()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    ?>
    <div class="wrap">
        <h2>Planche CORS Domain Settings</h2>

        <p>You may enter one or more comma-separated domains to allow access to this site using the CORS standard for
            authorizing cross site requests.</p>

        <p>To allow <em>any</em> site to access yours via CORS put a *, though explicitly listing domains is a better
            practice for production sites.</p>

        <form method="post" action="options.php">
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Allowed domains</th>
                    <td><textarea name="planche-cors" style="width:100%" rows="5"  placeholder="http://other.wordpressdoamin.xxx"/><?php echo get_option('planche-cors');
                        ?></textarea>
                </tr>
            </table>
            <?php
            settings_fields('planche-option-group');
            do_settings_sections('planche-option-group');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

/** Render the settings / options page in the admin dashboard */
function planche_settings_page()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    $user_id = get_current_user_id();

    $option_id = 'planche-config-'.$user_id;

    $config = json_decode(get_option( $option_id ));

    $exclude = isset($config->noIndexing) ? $config->noIndexing : $config->withoutIndexing;
    ?>
    <div class="wrap">
        <h2>Planche Settings</h2>

        <form method="post" action="options.php">
            <h3>No indexing databases</h3>
            <input type="hidden" name="noIndexings" />
            <?php
            foreach($exclude as $idx => $db){
                ?><div><img src="<?php echo plugin_dir_url(__FILE__)?>resources/images/icon_database.png"/><?php echo $db?></div><?php
            }
            ?>
            <h3>Automatically open the Connections window </h3>
            <input type="radio" name="autoLoadConnectionWindow" value="true"<?php checked( $config->autoLoadConnectionWindow ); ?> /> Yes
            <input type="radio" name="autoLoadConnectionWindow" value="false"<?php checked( !$config->autoLoadConnectionWindow ); ?> /> No
            <?php
            settings_fields('planche-option-group');
            do_settings_sections('planche-option-group');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}
?>
