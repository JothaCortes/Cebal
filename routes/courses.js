import Joi from 'joi';

const Courses = {
    method: ['GET'],
    path: '/courses',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }            

            return h.view('courses', { credentials: credentials,  admin});
        }
    }
};

export default Courses;
