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
                    _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                    type: 'alumnos',
                    status: 'enabled',
                    rut            :rut, //rut en base de datos: rut de la variable
                    birthday       :fechaNac,
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
                        resolve({ ok: 'Alumno ' + alumnObject.rut + ' agregado correctamente' });
                    });
                })
                
            },
            validate: {
                payload: Joi.object().keys({
                    rutalumno: Joi.string().allow(''),
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
    }
];

export default Students;

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx






