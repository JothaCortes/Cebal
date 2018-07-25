
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
                        type: 'alumnos',
                        courseSend: idCurso,
                        statusCourse: 'assigned'
                      },
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                    let ensayo = {
                        idCurso : idCurso,
                        nombreCurso : nombreCurso,
                        materia :materia,
                        nombrePrueba: nombrePrueba,
                        fechaPrueba: fechaPrueba,
                        nombreDocente: nombreDocente
                    }
                    console.log(result.docs[0])
                    let alumnosReduce = result.docs.reduce((arr, el, i)=>{
                      if (el.ensayos){
                          el.ensayos.push(ensayo)

                          
                            return arr.concat(el)

                      }else{
                          el.ensayos =[ensayo]
                          return arr.concat(el)
                      }
                    }, [])
                    console.log("reduce",alumnosReduce)
                    db.bulk({docs:alumnosReduce}, function(er) {
                        if (err) throw err;
                        resolve({ok: 'Ensayo creado correctamente'})
                    }); 
                    } else {
                        resolve({ err: 'No se ha podido crear el ensayo' });
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