import Joi from 'joi'
import cloudant from '../../config/db.js'
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js'
import { validate, clean, format }  from 'rut.js'
import { parse } from 'url';

let db = cloudant.db.use(configEnv.db)


const Joined = [
{ 
    method: 'POST',
    path: '/api/getStudent',
    options: {
        handler: (request, h) => {
            let rut = request.payload.rut;

            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': cleanRut(rut),
                        'type': 'alumnos',
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        resolve({ ok: result.docs[0] });
                    } else {
                        resolve({ err: 'El alumno no existe' });
                    }
                });
            })   
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string()
            })
        }
    }
},
{ 
    method: 'POST',
    path: '/api/queryrut',
    options: {
        handler: (request, h) => {
            let rut = request.payload.rut;

            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': cleanRut(rut),
                        'type': 'alumnos',
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        console.log('rut no disponible')
                        resolve({ err: `El rut ${result.docs[0]._id} ya existe en el sistema` });
                    } else {
                        console.log('rut disponible')
                        resolve({ ok: 'rut disponible' });
                    }
                });
            })   
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string()
            })
        }
    }
},
//Crear nuevo alumno
{ 
    method: 'POST',
    path: '/api/nuevoalumno',
    options: {
        handler: (request, h) => {
            let rut          = request.payload.rutalumno;
            let ciudad       = request.payload.ciudadAlumno;
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
            //let img          = request.payload.img;

            //console.log(img)

            let alumnObject = {
                _id: ktoK(cleanRut(rut)),
                date: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), // fecha de creacion
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
                emailAp        :correoAp,
                statusCourse   :'',
                courseSend     :'',
            }
            
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': cleanRut(rut)
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                        console.log(result)
                        resolve({ err: `El rut ${result.docs[0]._id} ya existe en el sistema` });
                    } else {
                        db.insert(alumnObject, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;
                            resolve({ ok: alumnObject });
                        });
                    }
                });
    
            })   
        },
        validate: {
            payload: Joi.object().keys({
                rutalumno: Joi.string().required(),
                ciudadAlumno:Joi.string().required(),
                fechaAlumno: Joi.string().required(),
                nombreAlumno: Joi.string().required(),
                apellido1Alumno: Joi.string().required(),
                apellido2Alumno: Joi.string().allow(''),
                correoAlumno: Joi.string().allow(''),
                celularAlumno: Joi.string().allow(''),
                direccionAlumno: Joi.string().required(),
                nombreApoderado: Joi.string().required(),
                parentescoApoderado: Joi.string().required(),
                trabajoApoderado: Joi.string().allow(''),
                celularApoderado: Joi.string().allow(''), 
                correoApoderado: Joi.string().allow(''),
                //img: Joi.string().allow('')
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
            let session = request.auth.credentials;
            let rutAlumno      = cleanRut(request.payload.rutAlumno);
            let colegio        = request.payload.colegio;
            let estadoEgreso   = request.payload.estadoEgreso;
            let beca           = request.payload.beca ;
            let anoEgreso      = request.payload.anoEgreso;
            let curso          = request.payload.curso;
            let promedio       = request.payload.promedio;
            let horario        = request.payload.horario;
            let etp            = request.payload.etp;
            let electivo       = request.payload.electivo;
            let electivo2      = request.payload.electivo2;
            let fechaMatricula = request.payload.fechaMatricula;
            let diaCobro       = request.payload.diaCobro;
            let tipoCurso      = request.payload.tipoCurso; // Intensivo o Anual

            let formaPago      = request.payload.formaPago;
            let descuento      = request.payload.descuento;
            let descuento2     = request.payload.descuento2;
            let valorMatricula = request.payload.valorMatricula;
            let numCuotas      = request.payload.numCuotas;
            let montoCuota     = request.payload.montoCuota;
            let totalCuotas    = request.payload.totalCuotas;
            let montoTotal     = request.payload.montoTotal;

            let yearSelected   = request.payload.yearSelected // año de cuotas
            let boleta         = request.payload.boleta;
            let formaPagoMatricula = request.payload.formaPagoMatricula;
            let cheque
            let estadoPrimeraCuota = request.payload.estadoPrimeraCuota;

            if(request.payload.cheque) {
                cheque = JSON.parse(request.payload.cheque)
                console.log(cheque)
            }
            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': rutAlumno, // solo id sin type !IMPORTANTE
                    }
                }, (err, result) => {
                    if (err) throw err;

                    if (result.docs[0]) {
                      
                        addEnrollmentCounter(session).then(res=>{
                            let student = result.docs[0];
                            let matriculaObject = {};

                            crearCuotas({
                                numCuotas: numCuotas,
                                montoCuota: montoCuota,
                                diaCobro: diaCobro,
                                matriculaDate: recreateDate(fechaMatricula), // fecha seleccionada de matricula
                                tipoCurso: tipoCurso, // Anual o Intensivo,
                                yearSelected: yearSelected
                            }).then(resCuotas=> {
                                matriculaObject = {
                                    date: recreateDate(fechaMatricula),//original // moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                                    numMatricula   :res, // "res" es numero de matricula
                                    colegio        :colegio,
                                    estadoEgreso   :estadoEgreso,
                                    beca           :beca,
                                    añoEgreso      :anoEgreso,
                                    curso          :curso,
                                    promedio       :promedio,
                                    horario        :horario,
                                    etp            :etp,
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
                                        montoTotal     :montoTotal,
                                        ticketEnrollment: boleta,
                                        cuotas: resCuotas.ok
                                    }
                                }
                                student.matricula = matriculaObject;
                                student.status = 'enrolled'
                                let cuotasApagar = [{num:0, monto:removePoints(valorMatricula)}] // matricula es la cuota 
                                let montoCuotaNew = parseInt(removePoints(valorMatricula)) // valor boleta 1
                                console.log(montoCuotaNew)
                                if (estadoPrimeraCuota == 'si'){
                                   
                                    montoCuotaNew += parseInt(matriculaObject.finance.cuotas[0].amount)  // cuota 0 + cuota 1 = valor boleta 1
                                    console.log(montoCuotaNew)
                                    cuotasApagar.push({num:matriculaObject.finance.cuotas[0].num, monto:matriculaObject.finance.cuotas[0].amount})
                                    student.matricula.finance.cuotas[0].status = 'payed'
                                    student.matricula.finance.cuotas[0].ticket = boleta
                                    student.matricula.finance.cuotas[0].payDay = recreateDate(fechaMatricula)
                                }
                                crearBoleta({
                                    numBoleta:boleta,
                                    credentials:session,
                                    rutAlumno: rutAlumno,
                                    cuotas:cuotasApagar,
                                    monto: montoCuotaNew.toString() ,
                                    formaPago: formaPagoMatricula,
                                    cheque: cheque
                                }).then(res2 =>{
                                    if(res2.ok) {
                                        db.insert(student, function (errUpdate, body) {
                                            if (errUpdate) throw errUpdate;
                                            resolve({ ok: 'Estudiante Matriculado Correctamente' });
                                        });
                                    } else {
                                        console.log(res2.err)
                                        resolve({err: res2.err})
                                    }      
                                })   
                            })  
                        })
                    } else {
                       resolve({ err: 'no se encuentra el alumno' });
                    }
                });
            })
        }, 
        validate: {
            payload: Joi.object().keys({
                rutAlumno: Joi.string().required(),
                colegio:Joi.string().required(),
                estadoEgreso: Joi.string().required(),
                beca: Joi.string().required(),
                anoEgreso: Joi.string().allow(''),
                curso: Joi.string().allow(''),
                promedio: Joi.string().required(),
                horario: Joi.string().required(),
                etp: Joi.string().required(),
                electivo: Joi.string().allow(''),
                electivo2: Joi.string().allow(''),
                fechaMatricula: Joi.string().required(),
                diaCobro: Joi.string().required(),
                tipoCurso: Joi.string().required(), 
                formaPago: Joi.string().required(), 
                descuento: Joi.string().allow(''), 
                descuento2: Joi.string().allow(''), 
                valorMatricula: Joi.string().required(), 
                numCuotas: Joi.string().required(),
                montoCuota: Joi.string().required(), 
                totalCuotas: Joi.string().required(), 
                montoTotal: Joi.string().required(),
                boleta: Joi.string().required(),
                yearSelected: Joi.string().required(),
                formaPagoMatricula : Joi.string().required(),
                cheque: Joi.string().allow(''),
                estadoPrimeraCuota: Joi.string().required()
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
                        'type': 'alumnos',
                        'city': credentials.place,
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
{ 
    method: 'GET',
    path: '/api/quotaNumbers',
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
                        resolve(result.docs[0].typeCourse)
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
              _id: cleanRut(estudianteDelete)
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
{
    method: 'POST',
    path: '/api/modStudent',
    options: {
        handler: (request, h) => {
            let id = request.payload.id;
            let birthday = request.payload.birthday;
            let name = request.payload.name;
            let lastname1 = request.payload.lastname1;
            let lastname2 = request.payload.lastname2;
            let email = request.payload.email;
            let phone = request.payload.phone;
            let address = request.payload.address;
            let nameAp = request.payload.nameAp;
            let relationshipAp = request.payload.relationshipAp;
            let workAp = request.payload.workAp;
            let phoneAp = request.payload.phoneAp;
            let emailAp = request.payload.emailAp;
            let modJoinedObj = {};
            

            return new Promise(resolve => {
                db.find({
                    "selector": {
                        "_id": cleanRut(id),
                        "type": "alumnos",
                        "status": "joined"
                    },
                    "limit": 1
                }, function (err, result) {
                    if (err) throw err;

                    if (result.docs[0]) {
                      
                        modJoinedObj = result.docs[0];
                        modJoinedObj.birthday = birthday;
                        modJoinedObj.name = name;
                        modJoinedObj.lastname1 = lastname1;
                        modJoinedObj.lastname2 = lastname2;
                        modJoinedObj.email = email;
                        modJoinedObj.phone = phone;
                        modJoinedObj.address = address;
                        modJoinedObj.nameAp = nameAp;
                        modJoinedObj.relationshipAp = relationshipAp;
                        modJoinedObj.workAp = workAp;
                        modJoinedObj.phoneAp = phoneAp;
                        modJoinedObj.emailAp = emailAp;

                        db.insert(modJoinedObj, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;

                            resolve({ ok: 'Alumno ' + modJoinedObj.name + ' modificado correctamente' });
                        });
                    } else {
                        resolve({ error: 'El alumno ' + name + ' no existe' });
                    }
                });
            });
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string().allow(''),
                birthday: Joi.string().allow(''),
                name: Joi.string().allow(''),
                lastname1: Joi.string().allow(''),
                lastname2: Joi.string().allow(''),
                email:Joi.string().allow(''),
                phone:Joi.string().allow(''),
                address: Joi.string().allow(''),
                nameAp: Joi.string().allow(''),
                relationshipAp: Joi.string().allow(''),
                workAp: Joi.string().allow(''),
                phoneAp: Joi.string().allow(''),
                emailAp: Joi.string().allow('')
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/testCuotas',
    options: {
        handler: (request, h) => {
            let num = request.payload.num;
            let amount = request.payload.amount;
            
            return new Promise(resolve=> {
                let quotaArray = []
                let today = moment.tz('America/Santiago').format('YYYY-MM-DD')
                let payDay = moment.tz('America/Santiago').format('YYYY-MM-'+String(4))
                let firstPayDay = ''
                
                if(moment(today).isAfter(payDay)) {
                    firstPayDay = moment(payDay).add(1, 'M').format('YYYY-MM-DD');
                } else {
                    firstPayDay = payDay
                }

                for (let i = 0; i <= num; i++) {
                    console.log(i)
                    if(i == num) {
                        console.log('FIN')
                        resolve(quotaArray)
                    } else {
                        quotaArray.push({
                            num: i+1,
                            amount: amount,
                            payday: firstPayDay,
                            status: pending
                        })
                        firstPayDay = moment(firstPayDay).add(1, 'M').format('YYYY-MM-DD');
                    }
                }  
            })
        },
        validate: {
            payload: Joi.object().keys({
                num: Joi.string().allow(''),
                amount: Joi.string().allow('')
            })
        }
    }
}
];

function addEnrollmentCounter(credentials) {
    console.log(credentials)
    return new Promise(resolve=>{
        db.find({
            "selector": {
                "_id": 'enrollmentCounter',
            }
        }, function (err, result) {
            if (err) throw err;
    
            if(result.docs[0]) {
                let counter = result.docs[0]
                counter[credentials.place]++
                db.insert(counter, function (errUpdate, body) {
                    if (errUpdate) throw errUpdate;
                    resolve(counter[credentials.place]);
                });
            }
        });
    })
}

function crearBoleta({numBoleta, credentials, rutAlumno, cuotas, monto, formaPago, cheque}) {
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
                    monto: removePoints(monto),
                    rutAlumno: cleanRut(rutAlumno),
                    place:credentials.place,
                    rutCreador: cleanRut(credentials.rut), // usuario que generó la boleta
                    formaPago:formaPago
                }
                
                if (cheque) {
                    newTicket.cheque = cheque
                    db.insert(newTicket, function (errUpdate, body) {
                        if (errUpdate) throw errUpdate;
                        resolve({ok:newTicket});
                    });
                } else {
                    db.insert(newTicket, function (errUpdate, body) {
                        if (errUpdate) throw errUpdate;
                        resolve({ok:newTicket});
                    });
                }
            }
        });
    })
}

function crearCuotas({numCuotas, montoCuota, diaCobro, matriculaDate, tipoCurso, yearSelected}) { //tipoCurso es Anual o Intensivo
    return new Promise(resolve=> {

        let quotaArray = []
        let initDate = ''
        let year = ''

        if(yearSelected == 'current') {
            year = moment.tz('America/Santiago').format('YYYY')
        } else if(yearSelected == 'next') {
            year = moment.tz('America/Santiago').add(1, 'Y').format('YYYY')
        }

        if(tipoCurso == 'Anual') {
            initDate = moment(matriculaDate).format(`${year}-03-${String(diaCobro)}`)
        } else if(tipoCurso == 'Intensivo') {
            initDate = moment(matriculaDate).format(`${year}-07-${String(diaCobro)}`)
        }

        for (let i = 0; i <= numCuotas; i++) {
            if(i == numCuotas) {
                resolve({ok:quotaArray})
            } else {

                quotaArray.push({
                    num: i+1,
                    amount: removePoints(montoCuota),
                    payday: initDate,
                    status: 'pending'
                })
                initDate = moment(initDate).add(1, 'M').format('YYYY-MM-DD');
            }
        }  
    })
}

function recreateDate(date) {
    let splitDate = date.split('/');
    let reDate = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}T00:00:00.00001`
    return reDate
}

const cleanRut = (rut) => {
    var replace1 = rut.split('.').join('');
    var replace2 = replace1.replace('-', '');
    return replace2;
}

const ktoK = (rut) => {
    let replace1 = rut.replace('k', 'K');
    return replace1
}

const removePoints = (amount) => {
    var replace = amount.split('.').join('');
    return replace;
}

export default Joined;

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx






