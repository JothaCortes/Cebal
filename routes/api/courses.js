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
//Mostrar alumnos por horario del curso seleccionado
{
    method: 'POST',
    path: '/api/alumnosporhorario',
    options: {
        handler: (request, h) => {
            let horario = request.payload.horario;
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gte: null
                        },
                        type: 'alumnos',
                        $not: {
                            statusCourse: 'assigned'
                        },
                        matricula: {
                            horario: horario
                        }
                    }
                }, function (err, result) {
                    if (err) throw err;

                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                                status: el.status,
                                name: el.name,
                                lastname1: el.lastname1,
                                lastname2: el.lastname2,
                                colegio:el.matricula.colegio,
                                añoEgreso:el.matricula.añoEgreso,
                                promedio:el.matricula.promedio,
                                horario:el.matricula.horario,
                                electivo:el.matricula.electivo,
                                electivo2:el.matricula.electivo2,
                                tipoCurso: el.matricula.tipoCurso
                            })
                        }, []) 
                        console.log(result)
                        resolve({ok: res})
                    } else {
                        resolve({ err: `No se encuentran alumnos con horario ${horario}`});
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
},
//GUARDAR ALUMNOS EN UN CURSO
{ 
    method: 'POST',
    path: '/api/asignarAlumnosACurso',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let alumnos   = JSON.parse(request.payload.alumnos);
            let curso     = request.payload.idCurso
            return new Promise(resolve=>{
                db.find({
                    selector: {
                      _id: curso,
                      status: 'enabled'
                    },
                    limit: 1
                  }, (err, result) => {
                      if (err) throw err;
                      
                      if(result.docs[0]) {
                            let alumnosReduce = alumnos.reduce((arr, el, i)=>{
                                return arr.concat({
                                    rut:el,
                                    date: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                                    usuario :`${credentials.name} ${credentials.lastname}`     
                                })
                            }, [])
                            console.log(alumnosReduce)
                            changeStudentCourseStatus(alumnos).then(res=>{
                                if(res.ok) {
                                    let addToCourse = result.docs[0]
                                    addToCourse.alumnos = alumnosReduce
                                  
                                    db.insert(addToCourse, function (errUpdate, body) {
                                        if (errUpdate) throw errUpdate;
                                        resolve(res.ok)
                                    });
                                } else if(res.err) {
                                    resolve(res.err)
                                }
                            })
                      }
                  });
            })
        },
        validate: {
            payload: Joi.object().keys({
                alumnos: Joi.string(),
                idCurso : Joi.string()
            })
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

function changeStudentCourseStatus(alumnos){
    return new Promise(resolve => {
        db.find({
            'selector': {
                '_id': {
                    '$in': alumnos
                },
                'type': 'alumnos',
            }
        }, (err, result) => {
            if (err) throw err;

            if (result.docs[0]) {
                //console.log(result.docs)

                let alumnosReduce = result.docs.reduce((arr, el, i)=>{
                    el.statusCourse = 'assigned'
                    return arr.concat(el)
                }, []) 

                db.bulk({docs:alumnosReduce}, function(er) {
                    if (err) throw err;
                    resolve({ok: 'Alumnos asignados correctamente'})
                });


            } else {
                resolve({ err: 'no existen alumnos' });
            }
        });
    });
}
export default Courses;