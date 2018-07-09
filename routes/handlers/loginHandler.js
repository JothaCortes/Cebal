import md5       from 'md5'
import cloudant  from '../../config/db.js'
import configEnv from '../../config/env_status.js'
import { validate, clean, format }  from 'rut.js'

let db = cloudant.db.use(configEnv.db)
let uuid = 1
const findUser = async (rut, password) => {
    return new Promise((resolve) => {
        db.find({
            selector: {
                _id: clean(rut),
                password: password,
                status: 'enabled',
                type: 'user'
            }
        }, (err, result) => {
            if (err) throw err

            if (result.docs[0]) {
                let data = result.docs[0]

                if(data.password === password) {
                    resolve(data)
                } else {
                    resolve(null)
                }
            } else {
                resolve(null)
            }
        })
    })
}

const login = async (request, h) => {
    if (request.auth.isAuthenticated) return h.redirect('/')

    let account = null

    if (request.method === 'post') {
        if(!request.payload.username || !request.payload.password) {
            return h.view('login', { message: 'Ingrese rut y contraseña' }, { layout: false })
        } else {
            account = await findUser(request.payload.username, md5(request.payload.password))

            if( !account ) {
                return h.view('login', { message: 'rut o contraseña incorrecta' }, { layout: false })
            } else {
                const sid = String(++uuid)
                account.rut = account._id
                delete account._id
                delete account._rev
                delete account.password
                console.log(account)
                await request.server.app.cache.set(sid, { account }, 0)
                request.cookieAuth.set({ sid })
                return h.redirect('/')                
            }
        }
    }


    if (request.method === 'get') return h.view('login', {}, { layout:false })
}

export default login