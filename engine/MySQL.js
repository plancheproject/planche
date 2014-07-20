Ext.define('Planche.engine.MySQL', function(){

	var queries = {
		SELECT_USER : 'SELECT * FROM `mysql`.`user`',
		SHOW_FULL_FIELDS : 'SHOW FULL FIELDS FROM `{0}`.`{1}`',
		SHOW_ADVANCED_PROPERTIES : 'SHOW TABLE STATUS FROM `{0}` LIKE "{1}"',
		SHOW_DATABASE : 'show databases',
		OPEN_TABLE : 'SELECT * FROM `{0}`.`{1}`',
		SHOW_PROCEDURES : 'SHOW PROCEDURE STATUS WHERE DB = "{0}"',
		SHOW_FUNCTIONS : 'SHOW FUNCTION STATUS WHERE DB = "{0}"',
		SHOW_TRIGGERS : 'SHOW TRIGGERS FROM `{0}`',
		SHOW_EVENTS : 'SELECT `Event_name`,`Definer`,`Event_type`,`Execute_at`,`Interval_value`,`Interval_field`,`Starts`,`Ends`,`Status` FROM `INFORMATION_SCHEMA`.`EVENTS` WHERE `EVENT_SCHEMA` = "{0}"',
		SHOW_VIEWS : 'SELECT `TABLE_NAME` AS View_name,`View_definition`,`Check_option`,`Is_updatable`,`Definer`,`Security_type` FROM `INFORMATION_SCHEMA`.`VIEWS` WHERE `TABLE_SCHEMA` = "{0}"',
		SHOW_DATABASE_DDL : 'SHOW CREATE DATABASE `{0}`',
		SHOW_TABLE_STATUS : 'SHOW TABLE STATUS FROM `{0}` WHERE ENGINE IS NOT NULL',
		ALTER_VIEW : 'SHOW CREATE TABLE `{0}`.`{1}`',
		CHANGE_TABLE_TYPE : 'ALTER TABLE `{0}`.`{1}` ENGINE = {2}',
		INSERT_TABLE : 'INSERT INTO `{0}`.`{1}` ({2}) VALUES({3});',		
		UPDATE_TABLE : 'UPDATE `{0}`.`{1}` SET {2} WHERE {3};',
		DELETE_TABLE : 'DELETE FROM `{0}`.`{1}` WHERE {2};',
		SELECT_TABLE : 'SELECT {2} FROM `{0}`.`{1}`;',
		TABLE_CREATE_INFO	: 'SHOW CREATE TABLE `{0}`.`{1}`',
		TABLE_FIELDS_INFO	: 'SHOW FULL FIELDS FROM `{0}`.`{1}`',
		TABLE_KEYS_INFO	: 'SHOW KEYS FROM `{0}`.`{1}`',
		CREATE_PROCEDURE : 'DELIMITER $$ CREATE /*[DEFINER = { user | CURRENT_USER }]*/ PROCEDURE `{0}`.`{1}`() /*LANGUAGE SQL | [NOT] DETERMINISTIC | { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA } | SQL SECURITY { DEFINER | INVOKER } | COMMENT \'string\'*/ BEGIN END$$ DELIMITER ;',
		CREATE_FUNCTION : 'DELIMITER $$ CREATE /*[DEFINER = { user | CURRENT_USER }]*/ FUNCTION `{0}`.`{1}`() RETURNS TYPE /*LANGUAGE SQL | [NOT] DETERMINISTIC | { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA } | SQL SECURITY { DEFINER | INVOKER } | COMMENT \'string\'*/ BEGIN END$$ DELIMITER ;',
		CREATE_TRIGGER : 'DELIMITER $$ CREATE /*[DEFINER = { user | CURRENT_USER }]*/ TRIGGER `{0}`.`{1}` BEFORE/AFTER INSERT/UPDATE/DELETE ON `{0}`.`<Table Name>` FOR EACH ROW BEGIN END$$ DELIMITER ;',
		CREATE_EVENT : 'DELIMITER $$ -- SET GLOBAL event_scheduler = ON$$     -- required for event to execute but not create CREATE /*[DEFINER = { user | CURRENT_USER }]*/	EVENT `{0}`.`{1}` ON SCHEDULE /* uncomment the example below you want to use */\n -- scheduleexample 1: run once\n \t--  AT \'YYYY-MM-DD HH:MM.SS\'/CURRENT_TIMESTAMP { + INTERVAL 1 [HOUR|MONTH|WEEK|DAY|MINUTE|...] }\n -- scheduleexample 2: run at intervals forever after creation\n \t-- EVERY 1 [HOUR|MONTH|WEEK|DAY|MINUTE|...]\n -- scheduleexample 3: specified start time, end time and interval for execution\n /*EVERY 1  [HOUR|MONTH|WEEK|DAY|MINUTE|...]\n STARTS CURRENT_TIMESTAMP/\'YYYY-MM-DD HH:MM.SS\' { + INTERVAL 1[HOUR|MONTH|WEEK|DAY|MINUTE|...] }\n ENDS CURRENT_TIMESTAMP/\'YYYY-MM-DD HH:MM.SS\' { + INTERVAL 1 [HOUR|MONTH|WEEK|DAY|MINUTE|...] } */ /*[ON COMPLETION [NOT] PRESERVE] [ENABLE | DISABLE] [COMMENT \'comment\']*/ DO BEGIN (sql_statements) END$$ DELIMITER ;',
		CREATE_VIEW : 'CREATE /*[ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}] [DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER }]*/ VIEW `{0}`.`{1}` AS (SELECT * FROM ...);'
	};
	
	var functions = "abs acos adddate addtime aes_decrypt aes_encrypt area asbinary aswkb ascii asin astext aswkt atan2 atan atan avg bdmpolyfromtext bdmpolyfromwkb bdpolyfromtext bdpolyfromwkb benchmark bin binary bit_and bit_count bit_length bit_or bit_xor boundary buffer cast ceil ceiling char_length char character_length charset coalesce coercibility collation compress concat_ws concat connection_id contains conv convert_tz convert cos cot count crc32 crosses curdate current_date current_time current_timestamp current_user current_user curtime database date_add date_format date_sub date datediff day dayname dayofmonth dayofweek dayofyear decode default degrees des_decrypt des_encrypt dimension disjoint div elt encode encrypt endpoint envelope equals exp export_set exteriorring extract extractvalue field find_in_set floor format found_rows from_base64 from_days from_unixtime geomcollfromtext geometrycollectionfromtext geomcollfromwkb geometrycollectionfromwkb geometrycollection geometryn geometrytype geomfromtext geometryfromtext geomfromwkb get_format get_lock glength greatest group_concat gtid_subset gtid_subtract hex hour if ifnull in inet_aton inet_ntoa inet6_aton inet6_ntoa insert instr interiorringn intersects interval is_free_lock is_ipv4_compat is_ipv4_mapped is_ipv4 is_ipv6 is_used_lock isclosed isempty isnull issimple last_day last_insert_id lcase least left length linefromtext linefromwkb linestringfromwkb linestring ln load_file localtime localtime localtimestamp localtimestamp locate log10 log2 log lower lpad ltrim make_set makedate maketime master_pos_wait max mbrcontains mbrdisjoint mbrequal mbrintersects mbroverlaps mbrtouches mbrwithin md5 microsecond mid min minute mlinefromtext multilinestringfromtext mlinefromwkb multilinestringfromwkb mod month monthname mpointfromtext multipointfromtext mpointfromwkb multipointfromwkb mpolyfromtext multipolygonfromtext mpolyfromwkb multipolygonfromwkb multilinestring multipoint multipolygon name_const not in now nullif numgeometries numinteriorrings numpoints oct octet_length old_password ord overlaps password period_add period_diff pi point pointfromtext pointfromwkb pointn polyfromtext polygonfromtext polyfromwkb polygonfromwkb polygon position pow power procedure analyse quarter quote radians rand random_bytes regexp release_lock repeat replace reverse right rlike round row_count rpad rtrim schema sec_to_time second session_user sha1 sha sha2 sign sin sleep soundex space sqrt srid st_contains st_crosses st_disjoint st_equals st_intersects st_overlaps st_touches st_within startpoint std stddev_pop stddev_samp stddev str_to_date strcmp subdate substr substring_index substring subtime sum sysdate system_user tan time_format time_to_sec time timediff timestamp timestampadd timestampdiff to_base64 to_days to_seconds touches trim truncate ucase uncompress uncompressed_length unhex unix_timestamp updatexml upper user utc_date utc_time utc_timestamp uuid_short uuid validate_password_strength values var_pop var_samp variance version wait_until_sql_thread_after_gtids week weekday weekofyear weight_string within x y year yearweek";
	var keywords = "accessible add all alter analyze and as asc asensitive before between bigint binary blob both by call cascade case change char character check collate column condition constraint continue convert create cross current_date current_time current_timestamp current_user cursor database databases day_hour day_microsecond day_minute day_second dec decimal declare default delayed delete desc describe deterministic distinct distinctrow div double drop dual each else elseif enclosed escaped exists exit explain false fetch float float4 float8 for force foreign from fulltext get grant group having high_priority hour_microsecond hour_minute hour_second if ignore in index infile inner inout insensitive insert int int1 int2 int3 int4 int8 integer interval into io_after_gtids io_before_gtids is iterate join key keys kill leading leave left like limit linear lines load localtime localtimestamp lock long longblob longtext loop low_priority master_bind master_ssl_verify_server_cert match maxvalue mediumblob mediumint mediumtext middleint minute_microsecond minute_second mod modifies natural nonblocking not no_write_to_binlog null numeric on optimize option optionally or order out outer outfile partition precision primary procedure purge range read reads read_write real references regexp release rename repeat replace require resignal restrict return revoke right rlike schema schemas second_microsecond select sensitive separator set show signal smallint spatial specific sql sqlexception sqlstate sqlwarning sql_big_result sql_calc_found_rows sql_small_result ssl starting straight_join table terminated then tinyblob tinyint tinytext to trailing trigger true undo union unique unlock unsigned update usage use using utc_date utc_time utc_timestamp values varbinary varchar varcharacter varying when where while with write xor year_month zerofill";
	var data_types = "tinyint int varchar float double timestamp bit bigint mediumint date time datetime year date enum set tinyblob mediumblob longblob blob varchar char geometr";

	return {
		singleton: true,
		constructor: function(config) {

			this.callParent(arguments);
		},
		getQuery : function(query){
			
			var args = Ext.Array.slice(arguments, 1);
			args.unshift(queries[query]);
			return Ext.String.format.apply(this, args);
		},
		getDataTypes : function(){

			return data_types;
		},
		getDataTypesToJSON : function(){

			var types = data_types.split(" ");
			var json = [];
			Ext.Array.each(types, function(type, idx){

				json.push([type, type]);
			})

			return json;
		},
		getFunctions : function(){

			return functions.split(" ");
		},

		getKeywords : function(){

			return keywords.split(" ");
		}
	}
});