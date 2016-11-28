Ext.define("Planche.overrides.RadioGroup", {
    override: "Ext.form.RadioGroup",
    setValue: Ext.Function.createSequence(
        Ext.form.RadioGroup.prototype.setValue,
        function(value){

            var idx = this.name || this.id;
            if(!Ext.isObject(value) && !Ext.isEmpty(idx)){
                var data = {};

                data[idx] = value;
                this.setValue(data);
            }
        }
    ),
    getValue: function(first){

       var value = this.callParent();
        if(Ext.Object.getSize(value) == 1 && first === true){

            return Ext.Object.getValues(value)[0];
        }
        else {

            return value;
        }
    }
});
