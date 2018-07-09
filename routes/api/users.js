import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone';
import md5 from 'md5';
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)

const Users = [{ // ver todos los usuarios
    method: 'GET',
    path: '/api/users',
    options: {
        handler: (request, h) => {
            return new Promise(resolve=>{
                db.find({
                    'selector': {
                        '_id': {
                            '$gte': null
                        },
                        'type': 'user',
                        'status': 'enabled'
                    }
                }, (err, result) => {
                    if (err) throw err;
                    
                    if(result.docs[0]) {
                        resolve(result.docs);   
                    } else {
                        resolve({err: 'no existen usuarios habilitados'});
                    }
                });
            });
        }
    }
}
];

export default Users;