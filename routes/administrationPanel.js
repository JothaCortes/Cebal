import Joi from 'joi';

const administrationPanel = {
    method: ['GET'],
    path: '/administrationPanel',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
      
            return h.view('administrationPanel', { credentials: credentials, admin:'ok'});
        }
    }
};

export default administrationPanel;