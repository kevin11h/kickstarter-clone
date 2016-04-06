import authHandler from './handlers/authentication';
import projectHandler from './handlers/projects';
import { isAuthenticated } from './helpers/passport-config';
import { isLoggedIn } from './helpers/helpers';


export default (app) => {
  // Home
  app.route('/')
    .get((req, res) => res.render('home'));

  // Home
  app.route('/about')
    .get((req, res) => res.render('about'));

  // Sign up
  app.route('/signup')
    .all(isLoggedIn)
    .get((req, res) => res.render('authentication/signup'))
    .post(authHandler.signup);

  // Log in
  app.route('/login')
    .all(isLoggedIn)
    .get((req, res) => res.render('authentication/login'))
    .post(authHandler.login);

  // Log in
  app.route('/logout')
    .get(authHandler.logout);

  // Forgot password
  app.route('/forgot-password')
    .all(isLoggedIn)
    .get((req, res) => res.render('authentication/forgot-password'));

  // Terms of Use
  app.route('/terms-of-use')
    .get((req, res) => res.render('authentication/terms-of-use'));

  // Privacy Policy
  app.route('/privacy')
    .get((req, res) => res.render('authentication/privacy'));

  // Project Lit
  app.route('/projects')
    .get(projectHandler.getProjectList);

  // Project Detail
  app.route('/projects/:id')
    .get(projectHandler.getProjectPage);

  // Create Project Page
  app.route('/create-project')
    .all(isAuthenticated)
    .get((req, res) => res.render('projects/project-create'))
    .post(projectHandler.postProjectCreate);
}
