import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)


const Courses = [

//GUARDAR CURSOS
{ 
    method: 'POST',
    path: '/api/newCourse',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let name   = request.payload.nameCourse;
            let year   = request.payload.yearCourse;
            let horary = request.payload.horaryCourse;
            let courseObject = {
                _id    : moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                type   : 'courses',
                status : 'enabled',
                name   : name,
                year   : year,
                horary : horary,
                city   : credentials.place
            }
            return new Promise(resolve => {
                db.insert(courseObject, function (errUpdate, body) {
                    if (errUpdate) throw errUpdate;
                    resolve({ ok: 'Curso ' + courseObject.name + ' agregado correctamente' });
                });
            }) 
        },
        validate: {
            payload: Joi.object().keys({
                nameCourse: Joi.string().allow(''),
                yearCourse:Joi.string().allow(''),
                horaryCourse: Joi.string().allow('')
            })
        }
    }
},

{ //TRAER CURSOS
    method: 'GET',
    path: '/api/cursosCebal', 
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': {
                            '$gte': null
                        },
                        'city': credentials.place,
                        'type': 'courses',
                        'status': 'enabled'
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                                name: el.name,
                                year: el.year,
                                horary: el.horary,
                                city: el.city
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
{ //TRAER ALUMNOS
    method: 'GET',
    path: '/api/alumnosAsignar', 
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': {
                            '$gte': null
                        },
                        'city': credentials.place,
                        'type': 'alumnos',
                        'status': 'enrolled'
                    }
                }, (err, result) => {
                    if (err) throw err;
                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                                status: el.status,
                                birthday:el.birthday,  
                                name: el.name,
                                lastname1: el.lastname1,
                                lastname2: el.lastname2,
                                email: el.email,
                                phone: el.phone,
                                address: el.address,
                                nameAp: el.nameAp,
                                relationshipAp: el.relationshipAp,
                                workAp: el.workAp,
                                phoneAp: el.phoneAp,
                                city: el.city,

                                colegio:el.matricula.colegio,
                                añoEgreso:el.matricula.añoEgreso,
                                promedio:el.matricula.promedio,
                                horario:el.matricula.horario,
                                electivo:el.matricula.electivo,
                                electivo2:el.matricula.electivo2,
                                apoderado: el.nameAp,
                                parentesco: el.relationshipAp,
                                workAp: el.workAp,
                                phoneAp:el.phoneAp,
                                date: el.matricula.date,
                                tipoCurso: el.matricula.tipoCurso,
                                formaP: el.matricula.finance.formaPago,

                                numCuotas:el.matricula.finance.numCuotas,
                                montoCuota:el.matricula.finance.montoCuota,
                                totalCuotas:el.matricula.finance.totalCuotas,
                                montoTotal: el.matricula.finance.montoTotal
                            })
                        }, []) 

                        resolve(res);
                    } else {
                        resolve({ err: 'no existen alumnos' });
                    }
                });
            });
        }
    }
},
//ELIMINAR CURSO
{ 
    method: 'DELETE',
    path: '/api/deleteCourse',
    options: {
      handler: (request, h) => {
        let curso = request.payload.curso;
  
        return new Promise(resolve => {
          db.find({
            selector: {
              _id: curso
            },
            limit: 1
          }, (err, result) => {
              if (err) throw err;
              
              if(result.docs[0]) {
  
                  db.destroy(result.docs[0]._id, result.docs[0]._rev, (err2, body) => {
                      if (err2) throw err2;
          
                      if(body.ok) resolve({ok: 'Curso eliminado correctamente'});
                  });
              }
          });
        });
      },
      validate: {
        payload: Joi.object().keys({
            curso: Joi.string()
        })
      }
    }
},
//MODIFICAR UN CURSO
{
    method: 'POST',
    path: '/api/modCourses',
    options: {
        handler: (request, h) => {
            let id = request.payload.id;
            let name = request.payload.name;
            let year = request.payload.year;
            let horary = request.payload.horary;
            let modCourseObj = {};

            return new Promise(resolve => {
                db.find({
                    "selector": {
                        "_id": id,
                        "type": "courses",
                        "status": "enabled",
                    },
                    "limit": 1
                }, function (err, result) {
                    if (err) throw err;

                    if (result.docs[0]) {
                        modCourseObj = result.docs[0];
                        modCourseObj.name = name;
                        modCourseObj.year = year;
                        modCourseObj.horary = horary;

                        db.insert(modCourseObj, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;

                            resolve({ ok: 'Curso ' + modCourseObj.name + ' modificado correctamente' });
                        });
                    } else {
                        resolve({ error: 'El horario ' + name + ' no existe' });
                    }
                });
            });
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string(),
                name: Joi.string(),
                year: Joi.string(),
                horary: Joi.string()
            })
        }
    }
},
//Obtener Horarios 
{ 
    method: 'GET',
    path: '/api/horariosCoursesTraer', 
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

];
export default Courses;