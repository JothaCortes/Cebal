import Joi from 'joi';

const Students = {
    method: ['GET'],
    path: '/students',
    options: {
       // auth: false,
        handler: (request, h) => {
            let credentials = request.auth.credentials;
      
            return h.view('students', { credentials: credentials, admin:'ok'});
        }
    }
};

export default Students;



