var Planche = Planche || {};
Planche.config = {
    hosts                   : [],
    withoutIndexing         : [
        'information_schema',
        'performance_schema',
        'mysql'
    ],
    autoLoadConnectionWindow: true
};
