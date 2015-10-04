Ext.define('Planche.lib.QuickCommand', {
    constructor: function() {

        this.commands = [];
    },

    append: function(command) {

        this.commands.push(command);
    },

    get: function() {

        return this.commands;
    }
});