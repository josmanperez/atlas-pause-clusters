exports = function(clusterName) {
  
  const privateKey    = context.values.get('privateKeyValue');
  const publicKey     = context.values.get('publicKeyValue');
  const baseUrl       = context.values.get('baseURL');
  const apiVersionUrl = context.values.get('apiVersionURL');
  const groupId       = context.values.get('groupId');
  
  context.http.patch({ 
    headers: {
      'Content-Type': [ 'application/vnd.atlas.2023-01-01+json' ],
      'Accept'      : [ 'application/vnd.atlas.2023-01-01+json' ]
    },
    scheme     : 'https',
    host       : baseUrl,
    path       : `${apiVersionUrl}/groups/${groupId}/clusters/${clusterName}`,
    digestAuth : true,
    query      : {
      'pretty' : ['true']
    },
    username   : publicKey,
    password   : privateKey,
    body       : {
      paused: true
    },
    encodeBodyAsJSON : true
  }).then(response => {
    const ejson_body = EJSON.parse(response.body.text());
    if ( (ejson_body.paused != null) && (ejson_body.paused) ) {
      console.log(`Cluster ${clusterName} has been paused`);
      return `Cluster ${clusterName} has been paused`;
    } else {
      console.log(ejson_body.detail);
      return ejson_body.detail;
    }
  }).catch(err => {
    console.error(err);
  });
  
  
};