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
      
                  resolve({ok:filterLogs});
                } else {
                  resolve({ err: 'NO EXISTEN LOGS EN EL SISTEMA'})
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
        let extra = request.payload.extra;
        let type = request.payload.type;
        let img;

        switch (type) {
          case type == 'createJoined':
            img = true;
            break;
          case type = 'createSchedule':
            img = true
          case type = 'newStudent':
            img = true
          case type = 'modStudent':
            img = true
          case type = 'matrStudent':
            img = true
          case type = 'pagarCuota':
            img = true
          case type = 'removerCuota':
            img = true
          default:
            break;
        }

        let credentials = {
          rut: session.rut,
          email: session.email,
          name: session.name,
          lastname: session.lastname,
          role: session.role
        };
        
        return new Promise(resolve => {
          let logData = {
            _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
            type: 'log',
            userRut: credentials.rut,
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
          action: Joi.string(),
          form: Joi.string(),
          extra: Joi.string().allow(''),
          type: Joi.string().allow('')
        })
      }
    }
},
{ // ver logs personalizados
  method: 'POST',
  path: '/api/getLogs',
  options: {
    handler: (request, h) => {
      let user = request.payload.user
      let startDate = request.payload.startDate
      let endDate = request.payload.endDate

      return new Promise(resolve => {
        let query = {
          selector: {
            _id: {
              $gte: null
            },
            type: 'log'
          },
          sort: [{
            _id: 'desc'
          }]
        }

        if (user) {
          query.selector.userRut = cleanRut(user)
        }

        if (startDate && endDate) {
          query.selector._id.$gte = startDate
          query.selector._id.$lte = endDate
        }

        db.find(query, (err, result) => {
          if (err) throw err

          console.log(result)
          let filterLogs = result.docs.map(function(log) {
            if (log.img) {
              log.img = log._id.replace(/:/g, 'Q');
              return log; 
            } else {
              log.img = '';
              return log;
            }
          });
          resolve(filterLogs)
        })
      })
    },
    validate: {
      payload: Joi.object().keys({
        user: Joi.string().allow(''),
        startDate: Joi.string().allow(''),
        endDate: Joi.string().allow('')
      })
    }
  }
}
];

const cleanRut = (rut) => {
  var replace1 = rut.split('.').join('');
  var replace2 = replace1.replace('-', '');
  return replace2;
}

export default Logs;