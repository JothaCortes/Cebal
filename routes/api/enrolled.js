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
                        let res = result.docs.map(el=>{
                            el.numMatricula = el.matricula.numMatricula
                            el._id = format(el._id)
                            return el
                        })

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
                        let res = result.docs.map(el=>{
                            el.numMatricula = el.matricula.numMatricula
                            el._id = format(el._id)
                            return el
                        })

                        resolve({ok: res});
                    } else {
                        resolve({ err: 'No existen alumnos retirados' });
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
                            formaPago: formaPago, // cash, check, transfer
                            cheque: cheque
                        }).then(res2=> {
                            if(res2.ok) {
                                db.insert(student, function(errUpdate, body) {
                                    if (errUpdate) throw errUpdate;

                                    if(cuotas.length > 1) {
                                        resolve({ok: 'Cuotas pagadas correctamente'});
                                    } else {
                                        resolve({ok: 'Cuota pagada correctamente'})
                                    } 
                                }) 
                            } else {
                                resolve({err: res2.err})
                            }
                        })
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
    path: '/api/removercuotas',
    options: {
        handler: (request, h) => {
            let session = request.auth.credentials
            let rut = request.payload.rut
            let cuotas = JSON.parse(request.payload.cuotas)

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

                        let res = originalFees.map((el, i, arr) => {
                            let fil = cuotas.filter(function(el2) {
                                return el.num == el2
                            })
                            if(fil[0]) {

                                return {
                                    num: el.num,
                                    amount: el.amount,
                                    payday: el.payday,
                                    status: 'removed',
                                    removedDay: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS')
                                }
                            } else {
                                return el
                            }         
                        })

                        student.matricula.finance.cuotas = res
                        
                        db.insert(student, function(errUpdate, body) {
                            if (errUpdate) throw errUpdate;

                            if(cuotas.length > 1) {
                                resolve({ok: 'Cuotas removidas correctamente'});
                            } else {
                                resolve({ok: 'Cuota removida correctamente'})
                            } 
                        }) 
                        
                    }
                });
            })
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string().required(),
                cuotas: Joi.string().required()
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
                studentAddress       :request.payload.studentAddress,
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
                db.find({
                    'selector': {
                        '_id': reqData.studentRut, // solo id sin type !IMPORTANTE
                    }
                }, (err, result) => {
                    if (err) throw err

                    if (result.docs[0]) {
                        let typeUser = result.docs[0].type
                        if(typeUser == 'user') {
                            typeUser = 'usuario'
                        } else if(typeUser == 'alumnos') {
                            typeUser = 'alumno'
                        }
                        resolve({ err: `No es posible agregar este alumno ya que el rut está siendo utilizado por un ${typeUser} ${format(reqData.studentRut)}` });
                    } else {
                        getEnrollmentCounter(session).then(res=>{
                            let matriculaObject = {}
                            matriculaObject.finance = {}
                            let student = {}

                            crearCuotas({
                                numCuotas: reqData.QuotasQty, // cantidad de cuotas
                                montoCuota: reqData.QuotaCost, // el valor de cada cuota por separado
                                diaCobro: reqData.payDay, // día del mes en que se cobrará: 01 02 03...
                                matriculaDate: recreateDate(reqData.enrollmentDate), // fecha seleccionada de matricula
                                tipoCurso: reqData.courseType, // yearly | intensive => Anual o Intensivo
                                yearSelected: reqData.yearSelected // current | next
                            }).then(resCuotas=> {
                                //ESTUDIANTE
                                student._id = reqData.studentRut
                                student.date = moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS')
                                student.type = 'alumnos'
                                student.status = 'enrolled'
                                student.city = session.place // ciudad del usuario logeado actualmente
                                student.birthday = reqData.studentBirthdate // fecha de nacimineto del estudiante
                                student.name = reqData.studentName
                                student.lastname1 = reqData.studentLastname
                                student.lastname2 = reqData.studentLastname2
                                student.email = reqData.studentEmail
                                student.phone = reqData.studentPhone
                                student.address = reqData.studentAddress
                                student.nameAp = reqData.assigneeName
                                student.relationshipAp = reqData.assigneeRelationship
                                student.workAp = reqData.assigneeWork
                                student.phoneAp = reqData.assigneePhone
                                student.emailAp = reqData.assigneeEmail
                                student.statusCourse = ''
                                student.courseSend = ''
                                //MATRICULA
                                matriculaObject.date = recreateDate(reqData.enrollmentDate) // fecha de matrícula seleccionada
                                matriculaObject.numMatricula = res[session.place] // res es número de la matrícula obtenida en getEnrollmentCounter()
                                matriculaObject.colegio = reqData.school // nombre de la escuela
                                matriculaObject.beca = ((reqData.beca == 'yes') ? 'Si' : 'No') // si es yes: Si, en caso contrario: No
                                matriculaObject.estadoEgreso = ((reqData.statusEgress == 'graduated') ? 'Egresado' : 'No egresado')
                                matriculaObject.añoEgreso = ((reqData.statusEgress == 'graduated') ? reqData.egressRes : '') // si es graduated: año en que se graduo, en caso contrario: ''
                                matriculaObject.curso = ((reqData.statusEgress == 'notGraduated') ? reqData.egressRes : '') // si es notGraduated: curso en el que va, en caso contrario '' 
                                matriculaObject.promedio = reqData.average // promedio: 10 a 70
                                matriculaObject.horario = reqData.horary // horario seleccionado
                                matriculaObject.etp = ((reqData.etp == 'yes') ? 'Si' : 'No') // etp: Si o No

                                if(reqData.science == 'true' && reqData.history == 'false') { // ciencias pero no historia
                                    console.log('CIENCIAS PERO NO HISTORIA')
                                    matriculaObject.electivo = 'Ciencias'
                                    matriculaObject.electivo2 = ''

                                    if(reqData.scienceElective == 'physics') {
                                        matriculaObject.electivoCiencias = 'Física'
                                    } else if(reqData.scienceElective == 'chemistry') {
                                        matriculaObject.electivoCiencias = 'Química'
                                    } else if(reqData.scienceElective == 'biology') {
                                        matriculaObject.electivoCiencias = 'Biología'
                                    }
                                } else if(reqData.science == 'true' && reqData.history == 'true') { // ciencias y historia
                                    console.log('CIENCIAS Y HISTORIA')
                                    matriculaObject.electivo = 'Ciencias'
                                    matriculaObject.electivo2 = 'Historia'

                                    if(reqData.scienceElective == 'physics') { 
                                        matriculaObject.electivoCiencias = 'Física'
                                    } else if(reqData.scienceElective == 'chemistry') {
                                        matriculaObject.electivoCiencias = 'Química'
                                    } else if(reqData.scienceElective == 'biology') {
                                        matriculaObject.electivoCiencias = 'Biología'
                                    }
                                } else if(reqData.history == 'true' && reqData.science == 'false') { // historia pero no ciencias
                                    console.log('HISTORIA PERO NO CIENCIAS')
                                    matriculaObject.electivo = 'Historia'
                                    matriculaObject.electivo2 = ''
                                    matriculaObject.electivoCiencias = ''
                                } else { // 'NI HISTORIA NI CIENCIAS'
                                    console.log('NI HISTORIA NI CIENCIAS')
                                    matriculaObject.electivo = ''
                                    matriculaObject.electivo2 = ''
                                    matriculaObject.electivoCiencias = ''
                                }

                                console.log(reqData.science, reqData.history, matriculaObject.electivo, matriculaObject.electivo2, matriculaObject.electivoCiencias)

                                matriculaObject.fechaMatricula = reqData.enrollmentDate // fecha matricula formato: DD/MM/YYYY
                                matriculaObject.diaCobro = reqData.payDay // Día del mes en que se cobra la cuota
                                matriculaObject.tipoCurso = ((reqData.courseType == 'yearly') ? 'Anual' : 'Intensivo') // Si el curso es yearly: Anual, en caso contrario: Intensivo
                                //FINANZAS
                                matriculaObject.finance.formaPago = ((reqData.payType == 'contado') ? 'Contado' : 'Cuotas') // contado o cuotas
                                matriculaObject.finance.descuento = reqData.discount1 // descuento 1
                                matriculaObject.finance.descuento2 = reqData.discount2 // descuento 2
                                matriculaObject.finance.valorMatricula = reqData.enrollmentCost // costo de matrícula
                                matriculaObject.finance.numCuotas = reqData.QuotasQty // cantidad de cuotas
                                matriculaObject.finance.montoCuota = reqData.QuotaCost // costo de cada cuota por separado
                                matriculaObject.finance.totalCuotas = reqData.totalQuotas // monto total de las cuotas
                                matriculaObject.finance.montoTotal = reqData.totalAmount // monto final: matricula + totalcuotas
                                matriculaObject.finance.ticketEnrollment = reqData.ticket // número de boleta
                                matriculaObject.finance.cuotas = resCuotas.ok // arreglo de cuotas

                                student.matricula = matriculaObject
                                let cuotasApagar = [{num:0, monto:removePoints(reqData.enrollmentCost)}]; // matricula es la cuota 0
                                let montoCuotaNew = parseInt(removePoints(reqData.enrollmentCost)); // valor boleta 1

                                if (reqData.firstQuota == 'yes'){
                                    montoCuotaNew += parseInt(matriculaObject.finance.cuotas[0].amount)  // cuota 0 + cuota 1 = valor boleta 1
                                    console.log(montoCuotaNew)
                                    cuotasApagar.push({num:matriculaObject.finance.cuotas[0].num, monto:matriculaObject.finance.cuotas[0].amount})
                                    student.matricula.finance.cuotas[0].status = 'payed'
                                    student.matricula.finance.cuotas[0].ticket = reqData.ticket
                                    student.matricula.finance.cuotas[0].payDay = recreateDate(reqData.enrollmentDate)
                                }

                                crearBoleta({
                                    numBoleta: reqData.ticket,
                                    credentials: session,
                                    rutAlumno: reqData.studentRut,
                                    cuotas: cuotasApagar,
                                    monto: montoCuotaNew.toString() ,
                                    formaPago: reqData.paymentMethod, // metodo de pago: efectivo, cheque, transferencia
                                    cheque: ((reqData.cheque) ? reqData.cheque : '')
                                }).then(res2 =>{
                                    if(res2.ok) {
                                        db.insert(student, function (errUpdate, body) {
                                            if (errUpdate) throw errUpdate;
                                            setEnrollmentCounter({counter: res, credentials: session}).then(resCounter=> {
                                                resolve({ ok: student });
                                            })
                                        });
                                    } else {
                                        console.log(res2.err)
                                        resolve({err: res2.err})
                                    }      
                                }) 
                            })
                        })    
                    }
                    
                })
                
            })
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
                statusEgress: Joi.string().required(), // graduated | notGraduated
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
},
{ 
    method: 'POST',
    path: '/api/modEnrollment',
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
                studentAddress      :request.payload.studentAddress,
                //APODERADO
                assigneeName        :request.payload.assigneeName,
                assigneeRelationship:request.payload.assigneeRelationship,
                assigneeWork        :request.payload.assigneeWork,
                assigneePhone       :request.payload.assigneePhone,
                assigneeEmail       :request.payload.assigneeEmail,
                //ACADEMICOS
                school              :request.payload.school,
                egressRes           :request.payload.egressRes,
                horary              :request.payload.horary,
                etp                 :request.payload.etp,
                science             :request.payload.science,
                history             :request.payload.history,
                scienceElective     :request.payload.scienceElective
            }

            return new Promise(resolve => {
                db.find({
                    'selector': {
                        '_id': reqData.studentRut, // solo id sin type !IMPORTANTE
                    }
                }, (err, result) => {
                    if (err) throw err

                    if (result.docs[0]) {
                        let student = result.docs[0]

                        student.birthday = reqData.studentBirthdate // fecha de nacimineto del estudiante
                        student.name = reqData.studentName
                        student.lastname1 = reqData.studentLastname
                        student.lastname2 = reqData.studentLastname2
                        student.email = reqData.studentEmail
                        student.phone = reqData.studentPhone
                        student.address = reqData.studentAddress
                        student.nameAp = reqData.assigneeName
                        student.relationshipAp = reqData.assigneeRelationship
                        student.workAp = reqData.assigneeWork
                        student.phoneAp = reqData.assigneePhone
                        student.emailAp = reqData.assigneeEmail

                        student.matricula.colegio = reqData.school 
                        student.matricula.horario = reqData.horary // horario seleccionado
                        student.matricula.etp = ((reqData.etp == 'yes') ? 'Si' : 'No') // etp: Si o No 
                        if(student.matricula.estadoEgreso == 'Egresado') {
                            student.matricula.añoEgreso = reqData.egressRes
                        } else if(student.matricula.estadoEgreso == 'No egresado') {
                            student.matricula.curso = reqData.egressRes
                        }

                        if(reqData.science == 'true' && reqData.history == 'false') { // ciencias pero no historia //16
                            console.log('CIENCIAS PERO NO HISTORIA')
                            student.matricula.electivo = 'Ciencias'
                            student.matricula.electivo2 = ''

                            if(reqData.scienceElective == 'physics') {
                                student.matricula.electivoCiencias = 'Física'
                            } else if(reqData.scienceElective == 'chemistry') {
                                student.matricula.electivoCiencias = 'Química'
                            } else if(reqData.scienceElective == 'biology') {
                                student.matricula.electivoCiencias = 'Biología'
                            }
                        } else if(reqData.science == 'true' && reqData.history == 'true') { // ciencias y historia
                            console.log('CIENCIAS Y HISTORIA')
                            student.matricula.electivo = 'Ciencias'
                            student.matricula.electivo2 = 'Historia'

                            if(reqData.scienceElective == 'physics') { 
                                student.matricula.electivoCiencias = 'Física'
                            } else if(reqData.scienceElective == 'chemistry') {
                                student.matricula.electivoCiencias = 'Química'
                            } else if(reqData.scienceElective == 'biology') {
                                student.matricula.electivoCiencias = 'Biología'
                            }
                        } else if(reqData.history == 'true' && reqData.science == 'false') { // historia pero no ciencias
                            console.log('HISTORIA PERO NO CIENCIAS')
                            student.matricula.electivo = 'Historia'
                            student.matricula.electivo2 = ''
                            student.matricula.electivoCiencias = ''
                        } else { // 'NI HISTORIA NI CIENCIAS'
                            console.log('NI HISTORIA NI CIENCIAS')
                            student.matricula.electivo = ''
                            student.matricula.electivo2 = ''
                            student.matricula.electivoCiencias = ''
                        }

                        db.insert(student, function (errUpdate, body) {
                            if (errUpdate) throw errUpdate;
                            
                            resolve({ ok: student });
                        });

                        
                    } else {
                        resolve({err: 'No se encuentra el estudiante.'})
                    }
                    
                })
                
            })
        }, 
        validate: {
            payload: Joi.object().keys({
                //ALUMNO
                studentRut: Joi.string().required(), // rut
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
                egressRes: Joi.string().required(), // si es egresado: año | si no es egresado: curso
                horary: Joi.string().required(), // horario
                etp: Joi.string().required(), // ETP no | yes
                science: Joi.string().required(), // ciencias true | false
                history: Joi.string().required(), // historia true | false
                scienceElective: Joi.string().allow(''), // si electivo de ciencias es true: physics | chemistry | biology  || si es false: ''
            })
        }
    }
},
{ 
    method: 'POST',
    path: '/api/getTicket',
    options: {
        handler: (request, h) => {
            let session = request.auth.credentials
            let ticket = request.payload.ticket
            
            return new Promise(resolve => {
                
                db.find({ 
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'boleta',
                        numBoleta: ticket,
                        place: session.place
                    },
                    "limit":1
                }, function(err, result) {
                    if (err) throw err;
                    
                    if(result.docs[0]) {
                        console.log(result.docs[0])
                        resolve({ok: result.docs[0]})
                    } else {
                        resolve({err: `No se encuentra la boleta ${ticket} en la sede ${session.place}.`})
                    }
                });
            })
        }, 
        validate: {
            payload: Joi.object().keys({
                ticket: Joi.string().required(), 
            })
        }
    }
}
]

function recreateDate(date) {
    let splitDate = date.split('/');
    let reDate = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}T00:00:00.00001`
    return reDate
}

function crearBoleta({numBoleta, credentials, rutAlumno, cuotas, monto, formaPago, cheque}) {
    return new Promise(resolve=>{
        console.log('CREANDO BOLETA')
        db.find({
            selector: {
                _id: {
                    $gte: null
                },
                type: 'boleta',
                numBoleta: numBoleta
            }
        }, function (err, result) {
            if (err) throw err;
            if(result.docs[0]) {
                console.log('YA EXISTE LA BOLETA')
                resolve({err: "ya existe la boleta "+ numBoleta})
            }else{
                console.log('No existe la boleta... creando')
                let paymentMethod = ''

                console.log('FORMA PAGO: '+formaPago)
                if(formaPago == 'check') {
                    paymentMethod = 'Cheque'
                } else if(formaPago == 'cash') {
                    paymentMethod = 'Efectivo'
                } else if(formaPago == 'transfer') {
                    paymentMethod = 'Transferencia'
                }
                console.log('FORMA PAGO2: '+paymentMethod)

                let newTicket = {
                    _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                    type: 'boleta',
                    numBoleta: numBoleta,
                    cuotas:cuotas,
                    monto: monto,
                    rutAlumno: cleanRut(rutAlumno),
                    place:credentials.place,
                    rutCreador: cleanRut(credentials.rut), // usuario que generó la boleta
                    formaPago: paymentMethod
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

        if(tipoCurso == 'yearly') {
            initDate = moment(matriculaDate).format(`${year}-03-${String(diaCobro)}`)
        } else if(tipoCurso == 'intensive') {
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

function getEnrollmentCounter(credentials) {
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
                
                resolve(counter)
            }
        });
    })
}

function setEnrollmentCounter({counter, credentials}) {
    return new Promise(resolve=>{
        db.insert(counter, function (errUpdate, body) {
            if (errUpdate) throw errUpdate;
            resolve(counter[credentials.place]);
        });
    })
}

const removePoints = (amount) => {
    var replace = amount.split('.').join('');
    return replace;
}

export default Enrolled;