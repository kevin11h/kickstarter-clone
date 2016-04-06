import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import cloudinary from 'cloudinary';
// import { cloudinaryConfig } from '../config';

import Project from '../models/project';

import { getDayTilEnd } from '../helpers/helpers';

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME || cloudinaryConfig.cloud_name ,
//   api_key: process.env.CLOUD_API || cloudinaryConfig.api_key,
//   api_secret: process.env.CLOUD_SECRET || cloudinaryConfig.api_secret
// });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET
});

const projectHandler = {
  getProjectList(req, res) {
    // console.log('USER: ', req.user);

    Project.find({}).populate('createdBy', 'name').limit(20).exec((err, projects) => {
      if (err) {
        req.flash('error', 'Something went wrong. Refresh.');
        return res.redirect('/');
      }

      console.log('projects', projects);

      // TODO: dayTil()
      // TODO: progressbar percentage

      return res.render(
        'projects/project-list',
        {projects: projects}
      );
    });
  },

  getProjectPage(req, res) {
    Project.findOne({_id: req.params.id}).populate('createdBy', 'name').exec((err, project) => {
      if (err) {
        req.flash('error', 'No project found.');
        return res.redirect('/');
      }

      console.log('Project: ', project);

      return res.render(
        'projects/project-page',
        {project: project, dayTil: getDayTilEnd(project.funding_end_date)}
      );
    });
  },

  postProjectCreate(req, res) {

    if (!req.user) {
      req.flash('error', 'You need to login first!');
      return res.redirect('/login');
    }

    // create an incoming form object
    const form = new formidable.IncomingForm();

    // parse the incoming request containing the form data
    form.parse(req, (err, fields, files) => {

      if (err) {
        // console.log('Parsing error: \n', err);
        req.flash('error', 'Failed to create your project. Try again.');
        return res.redirect('/create-project');
      }

      if (files.cover_photo.size > 0) {
        cloudinary.uploader.upload(files.cover_photo.path, (result) => {

          let newProject = new Project({
            createdBy: req.user,
            project_name: fields.project_name,
            short_description: fields.short_description,
            long_description: fields.long_description,
            funding_goal: fields.funding_goal,
            funding_end_date: fields.funding_end_date,
            file_path: result.secure_url,
            estimated_delivery: fields.estimated_delivery,
            location: fields.location
          });

          // TODO: check fields

          // Save in Database
          newProject.save((err, result) => {
            if (err) {
              // console.log('save err: ', err);
              req.flash('error', 'Something went wrong, project creation failed.');
              return res.redirect('/create-project');

            } else {
              // console.log('saved! ', result);
              req.flash('success','Project created!');
              return res.redirect('/projects');
            }
          });
        });

        // req.flash('success','Success!');
        // return res.redirect('/');

      } else {

        req.flash('error', 'Cover photo is missing!');
        return res.redirect('/create-project');
      }

    });

    // log any errors that occur
    form.on('error', (err) => {
      // console.log('An error has occured: \n' + err);
      req.flash('error', 'Failed to create project.');
      return res.redirect('/create-project');
    });

  }
}

export default projectHandler;
