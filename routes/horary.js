import Joi from 'joi';

const horary = {
    method: ['GET'],
    path: '/horary',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
      
            return h.view('horary', { credentials: credentials, admin:'ok'});
        }
    }
};

export default horary;



