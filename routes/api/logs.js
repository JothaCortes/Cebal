import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)

const Logs = [
{ // todos los logs
    method: 'GET',
    path: '/api/logs',
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
              db.find({
                'selector': {
                  _id: {
                    $gte: null
                  },
                  type: 'log'
                },
                'sort': [{
                  '_id': 'desc'
                }]
              }, (err, result) => {
                if (err) throw err
                //console.log(configEnv.db_logs)
                if (result.docs[0]) {
                  let filterLogs = result.docs.map(function(log) {
                    if(log.img) {
                      log.img = log._id.replace(/:/g, 'Q');
                      return log; 
                    }else {
                      log.img = '';
                      return log;
                    }
                  });
      
                  resolve(filterLogs);
                } else {
                  resolve({
                    error: 'NO EXISTEN LOGS EN EL SISTEMA'
                  })
                }
              })
            })
        }
    }
},
{ // crear un log
    method: 'POST',
    path: '/api/log',
    options: {
      handler: (request, h) => {
        let session = request.auth.credentials;
        let action = request.payload.action;
        let form = request.payload.form;
        let extra = request.paload.extra;
        let type = request.paload.type;
        let img;

        switch (type) {
          case type == 'createJoined':
            img = true;
            break;
          default:
            break;
        }

        let credentials = {
          email: session.email,
          name: session.name,
          lastname: session.lastname,
          role: session.role
        };
        
        return new Promise(resolve => {
          let logData = {
            _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
            userEmail: credentials.email,
            userName: credentials.name + ' ' + credentials.lastname,
            role: credentials.role,
            form: form,
            action: action,
            img: img
          }

          if(extra) logData.extra = extra;

          db.insert(logData, (errUpdate, body) => {
            if (errUpdate) throw errUpdate;
            resolve(body);
          });
        });
      },
      validate: {
        payload: Joi.object().keys({
          description: Joi.string(),
          form: Joi.string(),
          extra: Joi.string().allow(''),
          type: Joi.string().allow('')
        })
      }
    }
}
];

export default Logs;