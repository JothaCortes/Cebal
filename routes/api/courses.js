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
];
export default Courses;