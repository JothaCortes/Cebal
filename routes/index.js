
import loginHandler  from './handlers/loginHandler';
import logoutHandler from './handlers/logoutHandler';

import Joined      from './joined';
import APIJoined   from './api/joined';

import Enrolled    from './enrolled';
import APIEnrolled from './api/enrolled';


import listStudents from './listStudents';
import APIlistStudents from './api/listStudents';

import administrationPanel from './administrationPanel';
import APIadministrationPanel from './api/administrationPanel';

import logs from './logs';
import APIlogs from './api/logs';

import APITools from './api/tools';

const Login = {
    method: ['GET', 'POST'],
    path: '/login',
    options: {
      handler: loginHandler,
      auth: { mode: 'try' },
      plugins: { 'hapi-auth-cookie': { redirectTo: false } }
    }
  }
  
  const Logout = {
    method: ['GET', 'POST'],
    path: '/logout',
    options: {
      handler: logoutHandler
    }
  }

const Public = {
    method:'GET',
    path:'/public/{path*}',
    options:{
        auth: false,
        handler:{
            directory:{
                path:'./public',
                listing: false,
                index: false
            }
        }
    }
}

const imgLogs = {
    method: 'GET',
    path: '/img_logs/{path*}',
    options: {
      handler: {
        directory: {
          path: './img_logs',
          listing: false,
          index: false
        }
      }
    }
  };

const Home = {
    method:['get'],
    path: '/',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials
            let admin = ''

            if (credentials.role == 'sa') {
                admin = 'ok'
            }  

            return h.view('home', {credentials: credentials, admin})
        }
    }
}

const Routes = [].concat(
    Login,
    Logout,
    Public,
    imgLogs,
    Home,
    Joined,
    APIJoined,
    Enrolled,
    APIEnrolled,
    listStudents,
    APIlistStudents,
    administrationPanel,
    APIadministrationPanel,
    logs,
    APIlogs,
    APITools
)
export default Routes