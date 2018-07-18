import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';

let db = cloudant.db.use(configEnv.db)


const Enrolled = [
    //API TRAER ALUMNOS ENROLLED A TABLE
{ 
    method: 'GET',
    path: '/api/studentsEnrolled', 
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
                        'status': 'enrolled'
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        let res = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                _id: el._id,
                                numMatricula: el.matricula.numMatricula,
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
                                city: el.city,

                                colegio:el.matricula.colegio,
                                añoEgreso:el.matricula.añoEgreso,
                                promedio:el.matricula.promedio,
                                horario:el.matricula.horario,
                                electivo:el.matricula.electivo,
                                electivo2:el.matricula.electivo2,
                                apoderado: el.nameAp,
                                parentesco: el.relationshipAp,
                                workAp: el.workAp,
                                phoneAp:el.phoneAp,
                                date: el.matricula.date,
                                tipoCurso: el.matricula.tipoCurso,
                                formaP: el.matricula.finance.formaPago,
                                
                                numCuotas:el.matricula.finance.numCuotas,
                                montoCuota:el.matricula.finance.montoCuota,
                                totalCuotas:el.matricula.finance.totalCuotas,
                                montoTotal: el.matricula.finance.montoTotal,

                                numMatricula: el.matricula.numMatricula
                            })
                        }, []) 

                        resolve({ ok: res });
                    } else {
                        resolve({ err: 'no existen alumnos' });
                    }
                });
            });
        }
    }
},    //API TRAER ALUMNOS RETIRED A TABLE
{ 
    method: 'GET',
    path: '/api/studentsDisabled', 
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
                        'status': 'retired'
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
                                city: el.city,

                                colegio:el.matricula.colegio,
                                añoEgreso:el.matricula.añoEgreso,
                                promedio:el.matricula.promedio,
                                horario:el.matricula.horario,
                                electivo:el.matricula.electivo,
                                electivo2:el.matricula.electivo2,
                                apoderado: el.nameAp,
                                parentesco: el.relationshipAp,
                                workAp: el.workAp,
                                phoneAp:el.phoneAp,
                                date: el.matricula.date,
                                tipoCurso: el.matricula.tipoCurso,
                                formaP: el.matricula.finance.formaPago
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
{ // deshabilitar un alumno
    method: 'DELETE',
    path: '/api/deshabilitarAlumno',
    options: {
        handler: (request, h) => {
            let id = request.payload.estudianteDes;
            let studentData = {};
  
            return new Promise(resolve=>{
              db.find({ 
                "selector": {
                    '_id': id,
                    'type': 'alumnos',
                    'status': 'enrolled'
                },
                "limit":1
            }, function(err, result) {
                if (err) throw err;
  
                studentData = result.docs[0];
  
                studentData.status = 'retired';
  
                db.insert(studentData, function(errUpdate, body) {
                    if (errUpdate) throw errUpdate;
  
                    resolve({ok: 'Estudiante '+ studentData.name +' deshabilitado correctamente'}); 
                });  
              });
            }); 
        },
        validate: {
            payload: Joi.object().keys({
                estudianteDes: Joi.string()
            })
        }
    }
  },
  {
    method: 'POST',
    path: '/api/getCuotas',
    options: {
        handler: (request, h) => {
            let rut = request.payload.rut;
            
            return new Promise(resolve=> {
                db.find({ 
                    "selector": {
                        '_id': rut,
                        'type': 'alumnos',
                    }
                }, function(err, result) {
                    if (err) throw err;
      
                    if(result.docs[0]) {
                        resolve({ok:result.docs[0]})
                    }
                }); 
            })
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string().required()
            })
        }
    }
},
{
  method: 'POST',
  path: '/api/pagarcuotas',
  options: {
      handler: (request, h) => {
            let session = request.auth.credentials
            let rut = request.payload.rut
            let cuotas = JSON.parse(request.payload.cuotas)
            let ticket = request.payload.ticket
            let formaPago = request.patload.formaPago
          
            return new Promise(resolve=> {
                db.find({ 
                    "selector": {
                        '_id': rut,
                        'type': 'alumnos',
                    }
                }, function(err, result) {
                        if (err) throw err;
        
                        if(result.docs[0]) {
                            let student = result.docs[0]
                            let originalFees = student.matricula.finance.cuotas
                            let toTicket = []

                            let res = originalFees.map((el, i, arr) => {
                                let fil = cuotas.filter(function(el2) {
                                    return el.num == el2
                                })
                                if(fil[0]) {

                                    toTicket.push({
                                        num: el.num,
                                        monto: el.amount
                                    })

                                    return {
                                        num: el.num,
                                        amount: el.amount,
                                        payday: el.payday,
                                        status: 'payed',
                                        payedDay: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS')
                                    }
                                } else {
                                    return el
                                }         
                            });
                            
                            console.log(toTicket)
                            let resMonto = toTicket.reduce((numb, el, i)=>{
                                return numb += parseInt(el.monto) 
                            }, 0) 
                            
                            student.matricula.finance.cuotas = res

                            crearBoleta({
                                numBoleta: ticket,
                                credentials: session,
                                rutAlumno: rut,
                                cuotas: toTicket,
                                monto: resMonto,
                                formaPago: formaPago // efectivo, cheque, transferencia
                            }).then(res2=> {
                                db.insert(student, function(errUpdate, body) {
                                    if (errUpdate) throw errUpdate;
                                    
                                    if(res2.ok) {
                                        if(cuotas.length > 1) {
                                            resolve({ok: 'Cuotas pagadas correctamente'});
                                        } else {
                                            resolve({ok: 'Cuota pagada correctamente'})
                                        }  
                                    } else {
                                        resolve({err: res2.err})
                                    }
                                    
                                });
                            })
                            
                            //console.log(alumno, originalFees, cuotas)
                        }
                }); 
            })
      },
      validate: {
          payload: Joi.object().keys({
              rut: Joi.string().required(),
              cuotas: Joi.string().required(),
              ticket: Joi.string().required(),
              formaPago: Joi.string().required()
          })
      }
  }
}


];

function crearBoleta({numBoleta, credentials, rutAlumno, cuotas, monto, formaPago}) {
    return new Promise(resolve=>{
        console.log('CREANDO BOLETA')
        db.find({
            selector: {
                _id: {
                    $gte: null
                },
                type: "boleta",
                numBoleta: numBoleta
            }
        }, function (err, result) {
            if (err) throw err;
            if(result.docs[0]) {
                console.log('YA EXISTE LA BOLETA')
                resolve({err: "ya existe la boleta "+ numBoleta})
            }else{
                console.log('No existe la boleta... creando')
                let newTicket = {
                    _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                    type: 'boleta',
                    numBoleta: numBoleta,
                    cuotas:cuotas,
                    monto: monto,
                    rutAlumno: cleanRut(rutAlumno),
                    place:credentials.place,
                    rutCreador: cleanRut(credentials.rut), // usuario que generó la boleta
                    formaPago: formaPago
                }
                db.insert(newTicket, function (errUpdate, body) {
                    if (errUpdate) throw errUpdate;
                    resolve({ok:newTicket});
                });
            }
        });
    })
}

const cleanRut = (rut) => {
    var replace1 = rut.split('.').join('');
    var replace2 = replace1.replace('-', '');
    return replace2;
}

const removePoints = (amount) => {
    var replace = amount.split('.').join('');
    return replace;
}

export default Enrolled;