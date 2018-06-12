import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)

const administrationPanel = [
{ // QUOTA VALUES
    method: 'GET',
    path: '/api/quotaValues',
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
//Api editar valores de cuotas

//xxxxx

];
export default administrationPanel;