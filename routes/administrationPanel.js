import Joi from 'joi';

const administrationPanel = {
    method: ['GET'],
    path: '/administrationPanel',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let admin = '';
            
            if (credentials.role == 'sa') {
                admin = 'ok'
            }            

            return h.view('administrationPanel', { credentials: credentials, admin});
        }
    }
};

export default administrationPanel;