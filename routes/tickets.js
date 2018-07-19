import Joi from 'joi';

const Tickets = {
    method: ['GET'],
    path: '/tickets',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }            

            return h.view('tickets', { credentials: credentials, admin});
        }
    }
};

export default Tickets;

