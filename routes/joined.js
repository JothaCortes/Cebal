import Joi from 'joi';

const Joined = {
    method: ['GET'],
    path: '/joined',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }            

            return h.view('joined', { credentials: credentials, admin});
        }
    }
};

export default Joined;



