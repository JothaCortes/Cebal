import Joi from 'joi'
import moment from 'moment-timezone'
import fs from 'fs';

const Tools = [{ // todos los clientes habilitados
  method: 'GET',
  path: '/api/tools/getServerTime',
  options: {
    handler: (request, h) => {
      return new Promise(resolve => {
        resolve(moment().tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'))
      })
    }
  }
},
{
  method: 'POST',
  path: '/api/tools/uploadImgLog',
  options: {
    handler: (request, h) => {
        let img = request.payload.img.replace(/^data:image\/jpeg;base64,/, "");
        let id = request.payload.id;
        
      return new Promise(resolve => {
        fs.writeFile(`img_logs/${id}.jpeg`, img, 'base64', function(err) {
          console.log(err);

          resolve({ok: 'Imagen subida correctamente'});
        });        
      });
    },
    validate: {
      payload: Joi.object().keys({
        id: Joi.string().required(),
        img: Joi.string().required()
      })
    }
  }
}, 
{
    method: 'POST',
    path: '/api/tools/firstsearch',
    options: {
      handler: (request, h) => {
        let type = request.payload.type;
        let val = request.payload.val;
        let query;

        return new Promise(resolve=> {
            if (type == 'email') {
                query = {
                    selector: {
                        _id: {
                            $gte: null
                        },
                        type: 'alumnos',
                        email: val,
                        $not: {
                            status: 'disabled'
                        }
    
                    }
                }
            } else if (type == 'rut') {
                query = {
                    selector: {
                        _id: val
                    },
                    type: 'alumnos',
                    $not: {
                        status: 'disabled'
                    }
                }
            } else {
                let splitval = val.split(' ');
    
                let name = splitval[0];
                let lastname = val.substr(val.indexOf(' ') + 1);
    
                query = {
                    _id: {
                        $gte: null
                    },
                    type: 'alumnos',
                    $or: {
                        name: {
                            $regex: `(?i)${name}`
                        },
                        lastname: {
                            $regex: `(?i)${lastname}`
                        }  
                    }     
                }  
            }

            db.find(query, (err, result) => {
                if (err) throw err
      
                console.log(result)
                resolve(results)
            })
        })

      },
      validate: {
        payload: Joi.object().keys({
          type: Joi.string().required(),
          val: Joi.string().required()
        })
      }
    }
}, 
];

export default Tools
