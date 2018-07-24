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
//MODIFICAR VALORES DE CUOTAS
{
    method: 'POST',
    path: '/api/modValoresCuotas',
    options: {
        handler: (request, h) => {
            let status = request.payload.status;
            let score = request.payload.score;
            let price = request.payload.price;
            let modValorObj = {};

            return new Promise(resolve => {
                db.find({
                    "selector": {
                        "_id": "quotaValue",
                        //
                        
                    },
                    "limit": 1
                }, function (err, result) {
                    if (err) throw err;

                    if (result.docs[0]) {
                        console.log(result)
                        modValorObj = result.docs[0];
                        modValorObj.score = score;
                        modValorObj.price = price;

                        db.insert(modValorObj, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;

                            resolve({ ok: 'Valor ' + modValorObj.price + ' de nota ' + modValorObj.score + ' modificado correctamente' });
                        });
                    } else {
                        resolve({ error: 'El valor ' + price + ' no existe' });
                    }
                });
            });
        },
        validate: {
            payload: Joi.object().keys({
                
                status: Joi.string(),
                score: Joi.string(),
                price: Joi.string()
            })
        }
    }
}


];
export default administrationPanel;