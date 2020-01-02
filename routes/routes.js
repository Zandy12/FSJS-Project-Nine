const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Course = require('../models').Course;
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* Middleware to detect and validate current user logged in via authorization header (auth) */
const authenticateUser = async (req, res, next) => {
  const credentials = auth(req);

  let message;

  if (credentials) {
    // Mapping an email address from the database to req.body.emailAddress
    let user = await User.findAll({ where: {
      emailAddress: credentials.name
    } }).then(users => users[0].get({plain: true}));

    if (user) {
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

      if (authenticated) {
        console.log(`Authentication successful for username: ${user.firstName} ${user.lastName}`);
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.firstName} ${user.lastName}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  } 
};

  /******************
 *   USERS ROUTES
 ********************/

router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
  });
}));

router.post('/users', [
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "First Name"'), 
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Last Name"'), 
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Email Address"'), 
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "Password"'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
  
    const user = req.body;

    user.password = bcryptjs.hashSync(user.password);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      res.status(400).json({ errors: errorMessages });
    } else {
      const newUser = await User.create(user);
      res.json(newUser);
      return res.status(201).end();
    }
  }));

  /******************
 *  COURSES ROUTES
 ********************/

  /* GET- /courses */

  router.get('/courses', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    let courses = await Course.findAll({ where: {
      userId: user.id,
    }, raw: true });

    res.json(courses);
  }));

  /* POST- /courses */

  router.post('/courses', [
    check('title')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "Title"'), 
    check('description')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "Description"'), 
  ], authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    const errors = validationResult(req);
    const course = req.body;

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      res.status(400).json({ errors: errorMessages });
    } else {
      const newCourse = await Course.create({
        userId: user.id,
        title: course.title,
        description: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
      });
      res.json(newCourse);
      return res.status(201).end();
    }
    }));

  /* GET- /courses/:id */
  
  router.get("/courses/:id", authenticateUser, asyncHandler(async (req, res) => {
    const id = req.params.id;
    const user = req.currentUser;

    let courses = await Course.findAll({
      where: {
        userId: user.id
      }
    }, {raw: true});

    let i = 0;
    while (i < courses.length) {
      if (courses[i].dataValues.id == id) {
        const course = courses[i].dataValues;
        res.json({ course });
        break;
      } else {
        ++i;
      }
    } 

    if (i === courses.length) {
      res.status(400).json({ message: 'Course not found for ' + user.firstName});
    }
    if (i < courses.length) {
      res.status(204).end;
    }
  }));
  
  /* PUT- /courses/:id */

  router.put('/courses/:id',
    [
      check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "Title"'), 
      check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "Description"'), 
    ], authenticateUser, asyncHandler(async (req, res) => {
      const user = req.currentUser;
      const errors = validationResult(req);
      const course = req.body;
  
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        res.status(400).json({ errors: errorMessages });
      } else {
        let courseExistsForUser = false;

        let courses = await Course.findAll({
          where: {
            userId: user.id
          }
        }, {raw: true});
    
        let i = 0;
        while (i < courses.length) {
          if (courses[i].dataValues.id == req.params.id) {
            courseExistsForUser = true;
            break;
          } else {
            ++i;
          }
        } 

        if (courseExistsForUser) {
          await Course.update(
            {
              title: course.title,
              description: course.description,
              estimatedTime: course.estimatedTime,
              materialsNeeded: course.materialsNeeded,
            }, 
            {
              where: {
                id: parseInt(req.params.id),
              },
            }, {raw: true});
          const courseInfo = await Course.findAll({
            where: {
              id: req.params.id,
            }
          }, {raw: true});
          const displayCourseInfo = courseInfo[0].dataValues;
          res.json(displayCourseInfo);
          return res.status(201).end();
        } else if (!courseExistsForUser) {
          res.status(400).json({ message: 'Course not found for ' + user.firstName});
        }
      }
    }));
  
  /* DELETE- /courses/:id */

  router.delete('/courses/:id', authenticateUser, asyncHandler(async (req ,res) => {
    const id = req.params.id;
    const user = req.currentUser;

    let courses = await Course.findAll({
      where: {
        userId: user.id
      }
    }, {raw: true});

    let i = 0;
    while (i < courses.length) {
      if (courses[i].dataValues.id == id) {
        await Course.destroy({
          where: {
              id: id,
          }
        });
        res.json({ message: "Course: " + courses[i].dataValues.title + " has been successfully deleted for " + user.firstName + "." });
        break;
      } else {
        ++i;
      }
    } 

    if (i === courses.length) {
      res.status(400).json({ message: 'Course not found for ' + user.firstName});
    }
    if (i < courses.length) {
      res.status(204).end;
    }
  }));  

module.exports = router;