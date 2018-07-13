import Hapi           from 'hapi'
import Routes         from './routes/'
import Inert          from 'inert'
import Vision         from 'vision'
import Handlebars     from 'handlebars'
import Extend         from 'handlebars-extend-block'
import hapiAuthCookie from 'hapi-auth-cookie'
import Moment         from 'moment'

const server = Hapi.server({
    host: '0.0.0.0',
    port: 3310
})

const start = async () => {
    await server.register([
        Inert,
        Vision,
        hapiAuthCookie
    ])

    const cache = server.cache({ segment: 'sessions', expiresIn: Moment.duration(365, 'day').asMilliseconds() })
    server.app.cache = cache

    await server.auth.strategy('session', 'cookie', {
        password: 'password-should-be-32-characters',
        cookie: 'sid-cebal',
        redirectTo: '/login',
        isSecure: false,
        validateFunc: async (request, session) => {
            const cached = await cache.get(session.sid)
            const out = {
                valid: !!cached
            }

            if (out.valid) {
                out.credentials = cached.account
            }

            return out
        }
    })

    await server.auth.default('session')

    await server.route(Routes)
    await server.views({
        engines: {
            html: {
                module: Extend(Handlebars),
                isCached: false
            }
        },
        path: 'views',
        layoutPath: 'views/layout',
        layout: 'default'
    })
    await server.start()
    console.log(`Server started listening on ${server.info.uri}`)    
}

start()