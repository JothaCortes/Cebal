
import Joi from 'joi'
import cloudant from '../../config/db.js'
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js'
//import { validate, clean, format }  from 'rut.js'

let db = cloudant.db.use(configEnv.db)


const Scores = [
{  //traer cursos
    method: 'GET',
    path: '/api/coursesTraer', 
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': {
                            '$gte': null
                        },
                        'type': 'courses',
                        'city': credentials.place
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                                name: el.name,
                                year: el.year,
                                horary: el.horary
                            })
                        }, []) 

                        resolve(res);
                    } else {
                        resolve({ err: 'no existen cursos' });
                    }
                });
            });
        }
    }
},
//Obtener Horarios 
{ 
    method: 'GET',
    path: '/api/horaryTraer', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': {
                            '$gte': null
                        },
                        'type': 'horarios',
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
//crear prueba asignada a un curso
{ 
    method: 'POST',
    path: '/api/crearPrueba',
    options: {
        handler: (request, h) => {
            let idCurso        = request.payload.idCurso;
            let nombreCurso    = request.payload.nombreCurso;
            let materia        = request.payload.materia;
            let nombrePrueba   = request.payload.nombrePrueba;
            let fechaPrueba    = request.payload.fechaPrueba ;
            let nombreDocente = request.payload.nombreDocente ;
          
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: idCurso,
                        status: 'enabled'
                      },
                      limit: 1
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                    console.log(result.docs[0])
                        //resolve({ err: `El rut ${result.docs[0]._id} ya existe en el sistema` });
                    } else {
                        /*
                        db.insert(alumnObject, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;
                            resolve({ ok: alumnObject });
                        }); */
                    }
                });
    
            })   
        },
        validate: {
            payload: Joi.object().keys({
                idCurso : Joi.string().required(),
                nombreCurso: Joi.string().required(),
                materia:Joi.string().required(),
                nombrePrueba:Joi.string().required(),
                fechaPrueba:Joi.string().required(),
                nombreDocente:Joi.string().allow('')
              
            })
        }
    }
},
];
export default Scores;