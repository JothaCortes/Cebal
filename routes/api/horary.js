import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)


const horary = [
//Api Guardar Horarios
{ 
    method: 'POST',
    path: '/api/nuevoHorario',
    options: {
        handler: (request, h) => {
            let year  = request.payload.año;
            let place = request.payload.sede;
            let horary= request.payload.horario;
            let horaryObject = {
                _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                type  : 'horarios',
                status: 'enabled',
                year  :year,
                place : place,
                horary:horary
            }
            return new Promise(resolve => {
                db.insert(horaryObject, function (errUpdate, body) {
                    if (errUpdate) throw errUpdate;
                    resolve({ ok: 'Horario ' + horaryObject.horary + ' agregado correctamente' });
                });
            }) 
        },
        validate: {
            payload: Joi.object().keys({
                año: Joi.string().allow(''),
                sede:Joi.string().allow(''),
                horario: Joi.string().allow('')
            })
        }
    }
},
//xxxxx
//Obtener Horarios para dataTable
{ 
    method: 'GET',
    path: '/api/horariosCebal', 
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': {
                            '$gte': null
                        },
                        'type': 'horarios',
                        place : credentials.place
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                                year: el.year,
                                place: el.place,
                                horary: el.horary
                            })
                        }, []) 

                        resolve(res);
                    } else {
                        resolve({ err: 'no existen horarios' });
                    }
                });
            });
        }
    }
}, 
//Modificar los horarios
{
    method: 'POST',
    path: '/api/modHorary',
    options: {
        handler: (request, h) => {
            let id = request.payload.id;
            let year = request.payload.year;
            let place = request.payload.place;
            let horary = request.payload.horary;
            let modHorariosObj = {};

            return new Promise(resolve => {
                db.find({
                    "selector": {
                        "_id": id,
                        "type": "horarios",
                        "status": "enabled"
                    },
                    "limit": 1
                }, function (err, result) {
                    if (err) throw err;

                    if (result.docs[0]) {
                        modHorariosObj = result.docs[0];
                        modHorariosObj.year = year;
                        modHorariosObj.place = place;
                        modHorariosObj.horary = horary;

                        db.insert(modHorariosObj, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;

                            resolve({ ok: 'Horario ' + modHorariosObj.horary + ' modificado correctamente' });
                        });
                    } else {
                        resolve({ error: 'El horario ' + horary + ' no existe' });
                    }
                });
            });
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string(),
                year: Joi.string(),
                place: Joi.string(),
                horary: Joi.string()
            })
        }
    }
},
//fin modificar horarios
//Eliminar un horario
{ 
    method: 'DELETE',
    path: '/api/deleteHorario',
    options: {
      handler: (request, h) => {
        let horario = request.payload.horario;
  
        return new Promise(resolve => {
          db.find({
            selector: {
              _id: horario
            },
            limit: 1
          }, (err, result) => {
              if (err) throw err;
              
              if(result.docs[0]) {
  
                  db.destroy(result.docs[0]._id, result.docs[0]._rev, (err2, body) => {
                      if (err2) throw err2;
          
                      if(body.ok) resolve({ok: 'Horario eliminado correctamente'});
                  });
              }
          });
        });
      },
      validate: {
        payload: Joi.object().keys({
          horario: Joi.string()
        })
      }
    }
  }
//fin
];

const cleanRut = (rut) => {
    var replace1 = rut.split('.').join('');
    var replace2 = replace1.replace('-', '');
    return replace2;
}

const ktoK = (rut) => {
    let replace1 = rut.replace('k', 'K');
    return replace1
}

const removePoints = (amount) => {
    var replace = amount.split('.').join('');
    return replace;
}
export default horary;
