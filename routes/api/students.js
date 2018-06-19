import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)


const Students = [
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
    
                let alumnObject = {
                    _id: rut,
                    date: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                    type: 'alumnos',
                    status: 'enabled',
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
                    phoneAp        :celularAp 
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
                    celularApoderado: Joi.string().allow('') 
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
                    // 'place': credentials.place,
                        'type': 'alumnos',
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
                                phoneAp: el.phoneAp
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
}
];

export default Students;

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx






