import Joi from 'joi';

const horary = {
    method: ['GET'],
    path: '/horary',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }    
      
            return h.view('horary', { credentials: credentials, admin});
        }
    }
};

export default horary;



