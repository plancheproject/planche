Ext.define('Planche.lib.DBUtil', {
    singleton         : true,
    alternateClassName: ['Planche.DBUtil'],
    getAssocArray     : function(fields, records, upper_case_key) {

        upper_case_key = upper_case_key || false;

        if (upper_case_key) {

            Ext.Array.each(fields, function(field, fidx) {

                fields[fidx].name = field.name.toUpperCase();
            });
        }

        var tmp = [];
        Ext.Array.each(records, function(record, ridx) {

            var row = {};
            Ext.Array.each(fields, function(field, fidx) {

                row[field.name] = record[fidx];
            });

            tmp.push(row);
        });

        return tmp;
    }
});
