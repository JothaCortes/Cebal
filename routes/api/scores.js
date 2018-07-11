
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
];
export default Scores;