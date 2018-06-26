import Joi from 'joi';

const listStudents = {
    method: ['GET'],
    path: '/logs',
    options: {
       // auth: false,
        handler: async (request, h)  => {
            let credentials = request.auth.credentials;
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }            

            return h.view('logs', { credentials: credentials, admin});
        }
    }
};

export default listStudents;

