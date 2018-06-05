import Joi from 'joi';

const listStudents = {
    method: ['GET'],
    path: '/listStudents',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
      
            return h.view('listStudents', { credentials: credentials, admin:'ok'});
        }
    }
};

export default listStudents;



