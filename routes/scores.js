import Joi from 'joi';

const Scores = {
    method: ['GET'],
    path: '/scores',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }            

            return h.view('scores', { credentials: credentials, admin});
        }
    }
};

export default Scores;

