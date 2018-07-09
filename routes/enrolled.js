import Joi from 'joi';

const Enrolled = {
    method: ['GET'],
    path: '/enrolled',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }            

            return h.view('enrolled', { credentials: credentials,  admin});
        }
    }
};

export default Enrolled;



