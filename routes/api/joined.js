import Joi from 'joi'
import cloudant from '../../config/db.js'
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js'
import { validate, clean, format }  from 'rut.js'

let db = cloudant.db.use(configEnv.db)


const Joined = [
{ 
    method: 'POST',
    path: '/api/queryrut',
    options: {
        handler: (request, h) => {
            let rut = request.payload.rut;

            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': clean(rut),
                        'type': 'alumnos',
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        console.log('rut no disponible')
                        resolve({ err: `El rut ${result.docs[0]._id} ya existe en el sistema` });
                    } else {
                        console.log('rut disponible')
                        resolve({ ok: 'rut disponible' });
                    }
                });
            })   
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string()
            })
        }
    }
},
{ 
    method: 'POST',
    path: '/api/nuevoalumno',
    options: {
        handler: (request, h) => {
            let rut          = request.payload.rutalumno;
            let ciudad       = request.payload.ciudadAlumno;
            let fechaNac     = request.payload.fechaAlumno;
            let nombre       = request.payload.nombreAlumno;
            let apellido1    = request.payload.apellido1Alumno;
            let apellido2    = request.payload.apellido2Alumno;
            let correo       = request.payload.correoAlumno;
            let celular      = request.payload.celularAlumno;
            let direccion    = request.payload.direccionAlumno;
            let nombreAp     = request.payload.nombreApoderado;
            let parentescoAp = request.payload.parentescoApoderado;
            let trabajoAp    = request.payload.trabajoApoderado;
            let celularAp    = request.payload.celularApoderado;
            let correoAp     = request.payload.correoApoderado;
            //let img          = request.payload.img;

            //console.log(img)

            let alumnObject = {
                _id: clean(rut),
                date: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                type: 'alumnos',
                status: 'joined',
                city           :ciudad,
                birthday       :fechaNac, //fecha en base de datos || fecha variable arriba
                name           :nombre,
                lastname1      :apellido1,
                lastname2      :apellido2,
                email          :correo,
                phone          :celular,
                address        :direccion,
                nameAp         :nombreAp,
                relationshipAp :parentescoAp,
                workAp         :trabajoAp,
                phoneAp        :celularAp, 
                emailAp        :correoAp
            }
            
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': clean(rut),
                        'type': 'alumnos',
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        resolve({ err: `El rut ${result.docs[0]._id} ya existe en el sistema` });
                    } else {
                        db.insert(alumnObject, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;
                            resolve({ ok: alumnObject });
                        });
                    }
                });
    
            })   
        },
        validate: {
            payload: Joi.object().keys({
                rutalumno: Joi.string().required(),
                ciudadAlumno:Joi.string().required(),
                fechaAlumno: Joi.string().required(),
                nombreAlumno: Joi.string().required(),
                apellido1Alumno: Joi.string().required(),
                apellido2Alumno: Joi.string().allow(''),
                correoAlumno: Joi.string().allow(''),
                celularAlumno: Joi.string().allow(''),
                direccionAlumno: Joi.string().required(),
                nombreApoderado: Joi.string().required(),
                parentescoApoderado: Joi.string().required(),
                trabajoApoderado: Joi.string().allow(''),
                celularApoderado: Joi.string().allow(''), 
                correoApoderado: Joi.string().allow(''),
                //img: Joi.string().allow('')
            })
        }
    }
},
 // agregar Matricula al alumno
 { 
    method: 'POST',
    path: '/api/nuevaMatricula',
    options: {
        handler: (request, h) => {
            let session = request.auth.credentials;
            let rutAlumno      = request.payload.rutAlumno;
            let colegio        = request.payload.colegio;
            let estadoEgreso   = request.payload.estadoEgreso;
            let beca           = request.payload.beca ;
            let añoEgreso      = request.payload.añoEgreso;
            let curso          = request.payload.curso;
            let promedio       = request.payload.promedio;
            let horario        = request.payload.horario;
            let electivo       = request.payload.electivo;
            let electivo2      = request.payload.electivo2;
            let fechaMatricula = request.payload.fechaMatricula;
            let diaCobro       = request.payload.diaCobro;
            let tipoCurso      = request.payload.tipoCurso;

            let formaPago      = request.payload.formaPago;
            let descuento      = request.payload.descuento;
            let descuento2     = request.payload.descuento2;
            let valorMatricula = request.payload.valorMatricula;
            let numCuotas      = request.payload.numCuotas;
            let montoCuota     = request.payload.montoCuota;
            let totalCuotas    = request.payload.totalCuotas;
            let montoTotal     = request.payload.montoTotal;
            
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': rutAlumno,
                    }
                }, (err, result) => {
                    if (err) throw err;
                    if (result.docs[0]) {
                        let student = result.docs[0];
                        let matriculaObject ={};
                        addEnrollmentCounter(session).then(res=>{
                            
                            matriculaObject = {
                                date: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                                numMatricula   :res,
                                colegio        :colegio,
                                estadoEgreso   :estadoEgreso,
                                beca           :beca,
                                añoEgreso      :añoEgreso,
                                curso          :curso,
                                promedio       :promedio,
                                horario        :horario,
                                electivo       :electivo,
                                electivo2      :electivo2,
                                fechaMatricula :fechaMatricula,
                                diaCobro       :diaCobro,
                                tipoCurso      :tipoCurso,
                                finance: {
                                    formaPago      :formaPago,
                                    descuento      :descuento,
                                    descuento2     :descuento2,
                                    valorMatricula :valorMatricula,
                                    numCuotas      :numCuotas,
                                    montoCuota     :montoCuota,
                                    totalCuotas    :totalCuotas,
                                    montoTotal     :montoTotal
                                }
                            }
                        })

                        student.matricula = matriculaObject;
                        student.status = 'enrolled'
                        db.insert(student, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;
                            resolve({ ok: 'Estudiante Matriculado Correctamente' });
                        });
                    } else {
                       resolve({ err: 'no se encuentra el alumno' });
                    }
                });


            })
            
            
        }, 
        validate: {
            payload: Joi.object().keys({
                rutAlumno: Joi.string().allow(''),
                colegio:Joi.string().allow(''),
                estadoEgreso: Joi.string().allow(''),
                beca: Joi.string().allow(''),
                añoEgreso: Joi.string().allow(''),
                curso: Joi.string().allow(''),
                promedio: Joi.string().allow(''),
                horario: Joi.string().allow(''),
                electivo: Joi.string().allow(''),
                electivo2: Joi.string().allow(''),
                fechaMatricula: Joi.string().allow(''),
                diaCobro: Joi.string().allow(''),
                tipoCurso: Joi.string().allow(''), 
                formaPago: Joi.string().allow(''), 
                descuento: Joi.string().allow(''), 
                descuento2: Joi.string().allow(''), 
                valorMatricula: Joi.string().allow(''), 
                numCuotas: Joi.string().allow(''), 
                montoCuota: Joi.string().allow(''), 
                totalCuotas: Joi.string().allow(''), 
                montoTotal: Joi.string().allow('')
            })
        }
    }
},
//API TRAER ALUMNOS A TABLE
{ 
    method: 'GET',
    path: '/api/studentsCebal', 
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
                        'status': 'joined'
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
                                correoAp: el.emailAp,
                                city: el.city
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
//Obtener Horarios 
{ 
    method: 'GET',
    path: '/api/horariosCebalTraer', 
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
//traer valores de cuotas
{ 
    method: 'GET',
    path: '/api/quotaValuesCebal',
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id:'quotaValue'    
                    } 
                }, (err, result) => {
                    if (err) throw err
                    if (result.docs[0]) {
                        resolve(result.docs[0].statusList)
                    } else {
                        resolve({ err: 'No existen datos' })
                    }
                })
            })
        }
    }
},
{ 
    method: 'GET',
    path: '/api/quotaNumbers',
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id:'quotaValue'    
                    } 
                }, (err, result) => {
                    if (err) throw err
                    if (result.docs[0]) {
                        resolve(result.docs[0].typeCourse)
                    } else {
                        resolve({ err: 'No existen datos' })
                    }
                })
            })
        }
    }
},
//Eliminar un alumno
{ 
    method: 'DELETE',
    path: '/api/deleteAlumno',
    options: {
      handler: (request, h) => {
        let estudianteDelete = request.payload.estudianteDelete;
  
        return new Promise(resolve => {
          db.find({
            selector: {
              _id: estudianteDelete
            },
            limit: 1
          }, (err, result) => {
              if (err) throw err;
              
              if(result.docs[0]) {
  
                  db.destroy(result.docs[0]._id, result.docs[0]._rev, (err2, body) => {
                      if (err2) throw err2;
          
                      if(body.ok) resolve({ok: 'Registro eliminado correctamente'});
                  });
              }
          });
        });
      },
      validate: {
        payload: Joi.object().keys({
            estudianteDelete: Joi.string()
        })
      }
    }
  },
  //Modificar los horarios
{
    method: 'POST',
    path: '/api/modStudent',
    options: {
        handler: (request, h) => {
            let id = request.payload.id;
            let birthday = request.payload.birthday;
            let name = request.payload.name;
            let lastname1 = request.payload.lastname1;
            let lastname2 = request.payload.lastname2;
            let email = request.payload.email;
            let phone = request.payload.phone;
            let address = request.payload.address;
            let nameAp = request.payload.nameAp;
            let relationshipAp = request.payload.relationshipAp;
            let workAp = request.payload.workAp;
            let phoneAp = request.payload.phoneAp;
            let emailAp = request.payload.emailAp;
            let modJoinedObj = {};
            

            return new Promise(resolve => {
                db.find({
                    "selector": {
                        "_id": id,
                        "type": "alumnos",
                        "status": "joined"
                    },
                    "limit": 1
                }, function (err, result) {
                    if (err) throw err;

                    if (result.docs[0]) {
                      
                        modJoinedObj = result.docs[0];
                        modJoinedObj.birthday = birthday;
                        modJoinedObj.name = name;
                        modJoinedObj.lastname1 = lastname1;
                        modJoinedObj.lastname2 = lastname2;
                        modJoinedObj.email = email;
                        modJoinedObj.phone = phone;
                        modJoinedObj.address = address;
                        modJoinedObj.nameAp = nameAp;
                        modJoinedObj.relationshipAp = relationshipAp;
                        modJoinedObj.workAp = workAp;
                        modJoinedObj.phoneAp = phoneAp;
                        modJoinedObj.emailAp = emailAp;

                        db.insert(modJoinedObj, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;

                            resolve({ ok: 'Alumno ' + modJoinedObj.name + ' modificado correctamente' });
                        });
                    } else {
                        resolve({ error: 'El alumno ' + name + ' no existe' });
                    }
                });
            });
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string().allow(''),
                birthday: Joi.string().allow(''),
                name: Joi.string().allow(''),
                lastname1: Joi.string().allow(''),
                lastname2: Joi.string().allow(''),
                email:Joi.string().allow(''),
                phone:Joi.string().allow(''),
                address: Joi.string().allow(''),
                nameAp: Joi.string().allow(''),
                relationshipAp: Joi.string().allow(''),
                workAp: Joi.string().allow(''),
                phoneAp: Joi.string().allow(''),
                emailAp: Joi.string().allow('')
            })
        }
    }
}
];


function addEnrollmentCounter(credentials) {
    console.log(credentials)
    return new Promise(resolve=>{
        db.find({
            "selector": {
                "_id": 'enrollmentCounter',
            }
        }, function (err, result) {
            if (err) throw err;
    
            if(result.docs[0]) {
                let counter = result.docs[0]
                counter[credentials.place]++
                db.insert(counter, function (errUpdate, body) {
                    if (errUpdate) throw errUpdate;
                    resolve(counter[credentials.place]);
                });
            }
        });
    })
}


export default Joined;

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx






