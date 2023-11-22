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
        if ((cluster.name != null) && (!cluster.paused) ) {
          console.log(`For ${cluster.name}`);
          var date;
          if (cluster.tags != null) {
            let hasKeepUntil = cluster.tags.some(tag => {
              if (tag.key === 'keep_until' || tag.key === 'Keep_until') {
                date = new Date(tag.value);
              return true;
              }
            return false;
            });
            if (hasKeepUntil) {
              console.log('> has keep_until tag');
              if (date instanceof Date && !isNaN(date)) {
                if (new Date() > date) {
                  console.log(`> the tag date is before today, cluster ${cluster.name} will be paused`);
                  pauseCluster(cluster.name);
                } else {
                  console.log(`> the tag date is still valid, cluster ${cluster.name} won't be paused`);
                }
              }
            } else {
              console.log(`> cluster ${cluster.name} will be paused`);
              pauseCluster(cluster.name);
            }
          } else {
            console.log(`> cluster ${cluster.name} will be paused`);
            pauseCluster(cluster.name);
          }
        } 
      });
    }
  }).catch(err => {
    console.error(err);
  });
  
  
  function pauseCluster(name) {
    context.functions.execute('modifyCluster', name);
  }
  
};
