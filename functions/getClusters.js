exports = function() {
  
  const privateKey    = context.values.get('privateKeyValue');
  const publicKey     = context.values.get('publicKeyValue');
  const baseUrl       = context.values.get('baseURL');
  const apiVersionUrl = context.values.get('apiVersionURL');
  const groupId       = context.values.get('groupId');
  
  context.http.get({ 
    headers: {
      'Content-Type': [ 'application/vnd.atlas.2023-01-01+json' ],
      'Accept'      : [ 'application/vnd.atlas.2023-01-01+json' ]
    },
    scheme     : 'https',
    host       : baseUrl,
    path       : `${apiVersionUrl}/groups/${groupId}/clusters`,
    digestAuth : true,
    username   : publicKey,
    password   : privateKey
  }).then(response => {
    const ejson_body = EJSON.parse(response.body.text());
    if (ejson_body.results != null) {
      ejson_body.results.forEach(cluster => {
        if ( (cluster.name != null) && (!cluster.paused) ) {
          // Pause cluster
          context.functions.execute('modifyCluster', cluster.name);
        } 
      });
    }
  }).catch(err => {
    console.error(err);
  });
  
};
