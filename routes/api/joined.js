import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)


const Joined = [
    // agregar Alumno Cebal
    { 
        method: 'POST',
        path: '/api/nuevoalumno',
        options: {
            handler: (request, h) => {
                let rut          = request.payload.rutalumno;
                let ciudad       =request.payload.ciudadAlumno;
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
    
                let alumnObject = {
                    _id: rut,
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
                    db.insert(alumnObject, function (errUpdate, body) {
                        if (errUpdate) throw errUpdate;
                        resolve({ ok: 'Alumno ' + alumnObject.name + ' agregado correctamente' });
                    });
                })   
            },
            validate: {
                payload: Joi.object().keys({
                    rutalumno: Joi.string().allow(''),
                    ciudadAlumno:Joi.string().allow(''),
                    fechaAlumno: Joi.string().allow(''),
                    nombreAlumno: Joi.string().allow(''),
                    apellido1Alumno: Joi.string().allow(''),
                    apellido2Alumno: Joi.string().allow(''),
                    correoAlumno: Joi.string().allow(''),
                    celularAlumno: Joi.string().allow(''),
                    direccionAlumno: Joi.string().allow(''),
                    nombreApoderado: Joi.string().allow(''),
                    parentescoApoderado: Joi.string().allow(''),
                    trabajoApoderado: Joi.string().allow(''),
                    celularApoderado: Joi.string().allow(''), 
                    correoApoderado: Joi.string().allow('')
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
            let rutAlumno          = request.payload.rutAlumno;
            let colegio       =request.payload.colegio;
            let estadoEgreso     = request.payload.estadoEgreso;
            let beca       = request.payload.beca ;
            let añoEgreso    = request.payload.añoEgreso;
            let curso    = request.payload.curso;
            let promedio       = request.payload.promedio;
            let horario      = request.payload.horario;
            let electivo    = request.payload.electivo;
            let electivo2     = request.payload.electivo2;
            let fechaMatricula = request.payload.fechaMatricula;
            let diaCobro    = request.payload.diaCobro;
            let tipoCurso    = request.payload.tipoCurso;

            let formaPago    = request.payload.formaPago;
            let descuento    = request.payload.descuento;
            let descuento2    = request.payload.descuento2;
            let valorMatricula   = request.payload.valorMatricula;
            let numCuotas    = request.payload.numCuotas;
            let montoCuota    = request.payload.montoCuota;
            let totalCuotas    = request.payload.totalCuotas;
            let montoTotal    = request.payload.montoTotal;
            
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': rutAlumno,
                    }
                }, (err, result) => {
                    if (err) throw err;
                    if (result.docs[0]) {
                        let student = result.docs[0];
                        let matriculaObject = {
                            date: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
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
                        student.matricula = matriculaObject;
                        student.status = 'enrolled'
                        db.insert(student, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;
                            resolve({ ok: student });
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
/*{
    method: 'POST',
    path: '/api/modStudent',
    options: {
        handler: (request, h) => {
            let id = request.payload.id;
            let birthday = request.payload.birthday;
            let id = request.payload.name;
            let id = request.payload.lastname1;
            let id = request.payload.lastname2;
            let id = request.payload.email;
            let id = request.payload.phone;
            let id = request.payload.address;
            let id = request.payload.nameAp;
            let id = request.payload.relationshipAp;
            let id = request.payload.workAp;
            let id = request.payload.phoneAp;
            let id = request.payload. correoAp;
           


            let modHorariosObj = {};

            return new Promise(resolve => {
                db.find({
                    "selector": {
                        "_id": id,
                        'city': credentials.place,
                        'type': 'alumnos',
                        'status': 'joined'
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
} */
];

export default Joined;

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx






