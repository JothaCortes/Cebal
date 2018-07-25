import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';
//import { validate, clean, format }  from 'rut.js';

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

{ //TRAER CURSOS ENABLED
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
{ //TRAER CURSOS DISABLED (CURSOS CERRADOS)
    method: 'GET',
    path: '/api/cursosCebalClose', 
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
                        'status': 'close'
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                               // status: el.status,
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
//TRAER ALUMNOS A CURSO SELECCIONADO
{ 
    method: 'GET',
    path: '/api/alumnosporhorario', 
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
                        'status': 'enrolled',
                        $not: {
                            statusCourse: 'assigned'
                        }
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                                numMatricula: el.matricula.numMatricula,
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
                                apoderado: el.nameAp,
                                parentesco: el.relationshipAp,
                                workAp: el.workAp,
                                phoneAp:el.phoneAp,
                                emailAp: el.emailAp,

                                egreso:el.matricula.estadoEgreso,
                                beca:el.matricula.beca,
                                colegio:el.matricula.colegio,
                                añoEgreso:el.matricula.añoEgreso,
                                cursando:el.matricula.curso,
                                promedio:el.matricula.promedio,
                                horario:el.matricula.horario,
                                etp: el.matricula.etp,
                                electivo:el.matricula.electivo,
                                electivo2:el.matricula.electivo2,
                                
                                fechaMatricula:el.matricula.fechaMatricula,
                                date: el.matricula.date,
                                tipoCurso: el.matricula.tipoCurso,
                                formaP: el.matricula.finance.formaPago,

                                descuento1: el.matricula.finance.descuento,
                                descuento2: el.matricula.finance.descuento2,
                                
                                numCuotas:el.matricula.finance.numCuotas,
                                montoCuota:el.matricula.finance.montoCuota,
                                totalCuotas:el.matricula.finance.totalCuotas,
                                montoTotal: el.matricula.finance.montoTotal,

                            })
                        }, []) 

                        resolve({ ok: res });
                    } else {
                        resolve({ err: 'no existen alumnos' });
                    }
                });
            });
        }
    }
},


//Mostrar alumnos por horario del curso seleccionado
{
    method: 'POST',
    path: '/api/alumnosporcurso',
    options: {
        handler: (request, h) => {
            let idCurso = request.payload.idCurso;
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gte: null
                        },
                        type: 'alumnos',
                        statusCourse: 'assigned',
                        courseSend: idCurso 
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
                        resolve({ err: `No se encuentran alumnos`});
                    }
                });
            });
        },
        validate: {
            payload: Joi.object().keys({
                idCurso: Joi.string()
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
                            changeStudentCourseStatus(alumnos, curso).then(res=>{
                                if(res.ok) {
                                    let addToCourse = result.docs[0]
                                    if (!addToCourse.alumnos){
                                        addToCourse.alumnos = alumnosReduce
                                    }else{
                                        addToCourse.alumnos.push(alumnosReduce)
                                    }
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

{ // retirar alumno de un curso
    method: 'DELETE',
    path: '/api/retirarAlumno',
    options: {
        handler: (request, h) => {
            let id = request.payload.id;
            let alumnosData = {};
            console.log(alumnosData)
  
            return new Promise(resolve=>{
              db.find({ 
                "selector": {
                    '_id': id,
                    'type': 'alumnos',
                    'status': 'enrolled'
                },
                "limit":1
            }, function(err, result) {
                if (err) throw err;
                alumnosData = result.docs[0];
                alumnosData.statusCourse = '';
                alumnosData.courseSend = '';
                db.insert(alumnosData, function(errUpdate, body) {
                    if (errUpdate) throw errUpdate;
                    resolve({ok: 'Alumno '+ alumnosData.name +' retirado correctamente'}); 
                });  
              });
            }); 
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string()
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
{ // Abrir un curso
method: 'DELETE',
path: '/api/abrirCurso',
options: {
    handler: (request, h) => {
        let id = request.payload.id;
        let name = request.payload.name;
        let cursoOpenData = {};

        return new Promise(resolve=>{
            db.find({ 
            "selector": {
                '_id': id,
                'type': 'courses',
                'status': 'close',
                'name':name
            },
            "limit":1
        }, function(err, result) {
            if (err) throw err;
            cursoOpenData = result.docs[0];
            cursoOpenData.status = 'enabled';
            db.insert(cursoOpenData, function(errUpdate, body) {
                if (errUpdate) throw errUpdate;
                resolve({ok: 'Curso '+ cursoOpenData.name +' habilitado correctamente'}); 
            });  
            });
        }); 
    },
    validate: {
        payload: Joi.object().keys({
            id: Joi.string(),
            name: Joi.string()
        })
    }
}
},
{ // cerrar un curso
    method: 'DELETE',
    path: '/api/cerrarCurso',
    options: {
        handler: (request, h) => {
            let id = request.payload.id;
            let name = request.payload.name;
            let cursoData = {};
  
            return new Promise(resolve=>{
              db.find({ 
                "selector": {
                    '_id': id,
                    'type': 'courses',
                    'status': 'enabled',
                    'name':name
                },
                "limit":1
            }, function(err, result) {
                if (err) throw err;
                cursoData = result.docs[0];
                cursoData.status = 'close';
                db.insert(cursoData, function(errUpdate, body) {
                    if (errUpdate) throw errUpdate;
                    resolve({ok: 'Curso '+ cursoData.name +' deshabilitado correctamente'}); 
                });  
              });
            }); 
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string(),
                name: Joi.string()
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

function changeStudentCourseStatus(alumnos, curso){
   
    return new Promise(resolve => {
        db.find({
            'selector': {
                '_id': {
                    '$in':alumnos
                },
                'type': 'alumnos',
            }
        }, (err, result) => {
            if (err) throw err;

            if (result.docs[0]) {
                console.log(result.docs)

                let alumnosReduce = result.docs.reduce((arr, el, i)=>{
                    el.statusCourse = 'assigned'
                    el.courseSend = curso
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
const cleanRut = (rut) => {
    var replace1 = rut.split('.').join('');
    var replace2 = replace1.replace('-', '');
    return replace2;
}

export default Courses;