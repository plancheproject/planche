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
    },

    escapeString : function (str) {

        //https://gist.github.com/zirosas/9479236
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                                      // and double/single quotes
            }
        });
    }
});
