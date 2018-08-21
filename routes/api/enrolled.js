import Joi from 'joi';
import cloudant from '../../config/db.js';
import moment from 'moment-timezone'
import configEnv from '../../config/env_status.js';
import { validate, clean, format }  from 'rut.js'

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
                                _id: format(el._id),
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
                                apoderado: el.nameAp,
                                parentesco: el.relationshipAp,
                                workAp: el.workAp,
                                phoneAp:el.phoneAp,
                                emailAp: el.emailAp,

                                egreso:el.matricula.estadoEgreso,
                                beca:el.matricula.beca,
                                colegio:el.matricula.colegio,
                                añoEgreso:el.matricula.añoEgreso,
                                cursando:el.matricula.curso,
                                promedio:el.matricula.promedio,
                                horario:el.matricula.horario,
                                etp: el.matricula.etp,
                                electivo:el.matricula.electivo,
                                electivo2:el.matricula.electivo2,
                                diacobro:el.matricula.diaCobro,
                                
                                fechaMatricula:el.matricula.fechaMatricula,
                                date: el.matricula.date,
                                tipoCurso: el.matricula.tipoCurso,
                                formaP: el.matricula.finance.formaPago,

                                descuento1: el.matricula.finance.descuento,
                                descuento2: el.matricula.finance.descuento2,
                                
                                numCuotas:el.matricula.finance.numCuotas,
                                montoCuota:el.matricula.finance.montoCuota,
                                totalCuotas:el.matricula.finance.totalCuotas,
                                montoTotal: el.matricula.finance.montoTotal,

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
},
//Obtener Horarios 
{ 
    method: 'GET',
    path: '/api/horariosCebalTraerEnrroled', 
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
//API MODIFICAR ALUMNOS ENRROLED
{
    method: 'POST',
    path: '/api/modStudentEnrroledCebal',
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

            let colegio = request.payload.colegio;
            let horario = request.payload.horario;
            console.log("id alumno server",id)

            let modAlumnosCebalObj = {};

            return new Promise(resolve => {
                db.find({
                    "selector": {
                        "_id": cleanRut(id),
                        "type": "alumnos",
                        "status": "enrolled"
                    },
                    "limit": 1
                }, function (err, result) {
                    if (err) throw err;

                    if (result.docs[0]) {
                        console.log("res",result)
                        modAlumnosCebalObj = result.docs[0];
                        modAlumnosCebalObj.birthday = birthday;
                        modAlumnosCebalObj.name = name;
                        modAlumnosCebalObj.lastname1 = lastname1;
                        modAlumnosCebalObj.lastname2 = lastname2;
                        
                        modAlumnosCebalObj.email = email;
                        modAlumnosCebalObj.phone = phone;
                        modAlumnosCebalObj.address = address;
                        modAlumnosCebalObj.nameAp = nameAp;
                        modAlumnosCebalObj.relationshipAp = relationshipAp;
                        modAlumnosCebalObj.workAp = workAp;
                        modAlumnosCebalObj.phoneAp = phoneAp;
                        modAlumnosCebalObj.emailAp = emailAp;

                        modAlumnosCebalObj.matricula.colegio = colegio;
                        modAlumnosCebalObj.matricula.horario = horario;

                        db.insert(modAlumnosCebalObj, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;

                            resolve({ ok: 'Alumno  modificado correctamente' });
                        });
                    } else {
                        resolve({ error: 'El Alumno  no existe' });
                    }
                });
            });
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string(),
                birthday: Joi.string().allow(''),
                name: Joi.string().allow(''),
                lastname1: Joi.string().allow(''),
                lastname2: Joi.string().allow(''),
                email: Joi.string().allow(''),
                phone: Joi.string().allow(''),
                address: Joi.string().allow(''),
                nameAp: Joi.string().allow(''),
                relationshipAp: Joi.string().allow(''),
                workAp: Joi.string().allow(''),
                phoneAp: Joi.string().allow(''),
                emailAp: Joi.string().allow(''),
                colegio: Joi.string().allow(''),
                horario: Joi.string()
            })
        }
    }
},
//API TRAER ALUMNOS RETIRED A TABLE
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
                    '_id': cleanRut(id),
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
  
                    resolve({ok: 'Matrícula de estudiante '+ studentData.name +' cerrada correctamente'}); 
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
            let rut = cleanRut(request.payload.rut);
            console.log(rut)
            return new Promise(resolve=> {
                db.find({ 
                    "selector": {
                        '_id': rut,
                        'type': 'alumnos',
                    }
                }, function(err, result) {
                    if (err) throw err;
                    
                    console.log(result)
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
            let formaPago = request.payload.formaPago
            let cheque

            if(request.payload.cheque) {
                cheque = JSON.parse(request.payload.cheque)
                console.log(cheque)
            }

            return new Promise(resolve=> {
                db.find({ 
                    "selector": {
                        '_id': cleanRut(rut),
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
                                        payedDay: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                                        ticket: ticket
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
                                rutAlumno: cleanRut(rut),
                                cuotas: toTicket,
                                monto: resMonto,
                                formaPago: formaPago, // efectivo, cheque, transferencia
                                cheque: cheque
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
              formaPago: Joi.string().required(),
              cheque: Joi.string().allow(''),
          })
      }
  }
},
{
    method: 'POST',
    path: '/api/getObservations',
    options: {
        handler: (request, h) => {
            let rut = request.payload.rut;
            
            return new Promise(resolve=> {
                db.find({ 
                    "selector": {
                        '_id': cleanRut(rut),
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
    path: '/api/createObservation',
    options: {
        handler: (request, h) => {
            let rut = request.payload.rut;
            let title = request.payload.title;
            let text = request.payload.text;
            
            return new Promise(resolve=> {
                db.find({ 
                    "selector": {
                        '_id': cleanRut(rut),
                        'type': 'alumnos',
                    }
                }, function(err, result) {
                    if (err) throw err;
      
                    if(result.docs[0]) {
                        let student = result.docs[0]
                        let obj = {
                            date: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                            title: title,
                            text: text
                        }
                    
                        if(student.observations) {
                            student.observations.push(obj)

                            db.insert(student, function (errUpdate, body) {
                                if (errUpdate) throw errUpdate;
                                resolve({ok:obj})
                            });

                            
                        }else {
                            student.observations = [obj]

                            db.insert(student, function (errUpdate, body) {
                                if (errUpdate) throw errUpdate;
                                resolve({ok:obj})
                            });
                        }
                        
                    }
                }); 
            })
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string().required(),
                title: Joi.string().required(),
                text: Joi.string().required()
            })
        }
    }
},
{ 
    method: 'POST',
    path: '/api/newEnrollment',
    options: {
        handler: (request, h) => {
            let session = request.auth.credentials
            let reqData = {
                //ALUMNO
                studentRut          :request.payload.studentRut,
                studentBirthdate    :request.payload.studentBirthdate,
                studentName         :request.payload.studentName,
                studentLastname     :request.payload.studentLastname,   
                studentLastname2    :request.payload.studentLastname2,
                studentEmail        :request.payload.studentEmail,
                studentPhone        :request.payload.studentPhone,
                studentAdress       :request.payload.studentAdress,
                //APODERADO
                assigneeName        :request.payload.assigneeName,
                assigneeRelationship:request.payload.assigneeRelationship,
                assigneeWork        :request.payload.assigneeWork,
                assigneePhone       :request.payload.assigneePhone,
                assigneeEmail       :request.payload.assigneeEmail,
                //ACADEMICOS
                school              :request.payload.school,
                statusEgress        :request.payload.statusEgress,
                egressRes           :request.payload.egressRes,
                beca                :request.payload.beca,
                average             :request.payload.average,
                horary              :request.payload.horary,
                etp                 :request.payload.etp,
                science             :request.payload.science,
                history             :request.payload.history,
                scienceElective     :request.payload.scienceElective,
                //MATRICULA
                enrollmentDate      :request.payload.enrollmentDate,
                payDay              :request.payload.payDay,
                courseType          :request.payload.courseType,
                payType             :request.payload.payType,
                yearSelected        :request.payload.yearSelected,
                //DESCUENTOS
                discount1           :request.payload.discount1,
                discount2           :request.payload.discount2,
                //PAGO
                firstQuota          :request.payload.firstQuota,
                paymentMethod       :request.payload.paymentMethod,
                ticket              :request.payload.ticket,
                //MONTOS
                enrollmentCost      :request.payload.enrollmentCost,
                QuotasQty           :request.payload.QuotasQty,
                QuotaCost           :request.payload.QuotaCost,
                totalQuotas         :request.payload.totalQuotas,
                totalAmount         :request.payload.totalAmount,
            }

            if(request.payload.cheque) {
                reqData.cheque = JSON.parse(request.payload.cheque)
            }
            return new Promise(resolve => {
                resolve(reqData) 
            })
            /*
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
                            let matriculaObject ={};

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
                                let cuotasApagar = [{num:0, monto:removePoints(valorMatricula)}]; // matricula es la cuota 
                                let montoCuotaNew = parseInt(removePoints(valorMatricula)); // valor boleta 1
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
            */
        }, 
        validate: {
            payload: Joi.object().keys({
                //ALUMNO
                studentRut: Joi.string().required(), // rut alumno
                studentBirthdate: Joi.string().required(), // fecha de nacimiento alumno
                studentName: Joi.string().required(), // nombre alumno
                studentLastname: Joi.string().required(), //apellido paterno alumno
                studentLastname2: Joi.string().allow(''), // apellido materno alumno
                studentEmail: Joi.string().allow(''), // email alumno
                studentPhone: Joi.string().allow(''), // teléfono alumno
                studentAddress: Joi.string().required(),  // dirección alumno
                //APODERADO
                assigneeName: Joi.string().required(), // nombre completo apoderado
                assigneeRelationship: Joi.string().required(), // parentesco apoderado
                assigneeWork: Joi.string().allow(''), // lugar de trabajo apoderado
                assigneePhone: Joi.string().allow(''), // telefono apoderado
                assigneeEmail: Joi.string().allow(''), // correo apoderado
                //ACADEMICOS
                school: Joi.string().required(),    // colegio
                statusEgress: Joi.string().required(), // egresado | no egresado
                egressRes: Joi.string().required(), // si es egresado: año | si no es egresado: curso
                beca: Joi.string().required(), // beca  no | yes
                average: Joi.string().required(), // promedio 10 a 70
                horary: Joi.string().required(), // horario
                etp: Joi.string().required(), // ETP no | yes
                science: Joi.string().required(), // ciencias true | false
                history: Joi.string().required(), // historia true | false
                scienceElective: Joi.string().allow(''), // si electivo de ciencias es true: physics | chemistry | biology  || si es false: ''
                //MATRICULA
                enrollmentDate: Joi.string().required(), // FECHA DE MATRICULA (SELECCIONADA)
                payDay: Joi.string().required(), // DÍA DE PAGO: 01 02 03...
                courseType: Joi.string().required(), // yearly | intensive
                payType: Joi.string().required(), // tipo de pago:  contado | cuotas
                yearSelected: Joi.string().required(), // año seleccionado (para pago de cuotas) next | current
                //DESCUENTOS
                discount1: Joi.string().allow(''), // descuento1: nombre del descuento1
                discount2: Joi.string().allow(''), // descuento2: nombre del descuento2
                //PAGO
                firstQuota: Joi.string().required(), // pagar primera cuota en la boleta de matricula: no | yes
                paymentMethod: Joi.string().required(), // metodo de pago: cash | check | transfer
                ticket: Joi.string().required(), // numero de boleta: 1 2 3 .... 
                cheque: Joi.string().allow(''),
                //MONTOS
                enrollmentCost: Joi.string().required(), // costo de la matrícula
                QuotasQty: Joi.string().required(), // cantidad de cuotas
                QuotaCost: Joi.string().required(), // valor de cada cuota por separado
                totalQuotas: Joi.string().required(), // monto total de todas las cuotas juntas
                totalAmount: Joi.string().required() // monto final: matricula + totalcuotas
            })
        }
    }
}
];

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
                    monto: monto,
                    rutAlumno: cleanRut(rutAlumno),
                    place:credentials.place,
                    rutCreador: cleanRut(credentials.rut), // usuario que generó la boleta
                    formaPago: formaPago
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