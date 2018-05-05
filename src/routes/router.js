let express = require('express');
let router = express.Router();
let User = require('../models/user');
let Question = require('../models/question');
let request = require('request');
let mongoose = require('mongoose');

var methodOverride = require('method-override')
router.use(methodOverride('_method'));

// GET Home route depending on whether there is an active session (user logged in or not)
router.get('/', (req, res, next) => {
  User.findById(req.session.userId)
  .exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.render('index');
      } else {
        return res.render('index', { user: user });
      }
    }
  });
});

// GET Login route depending on whether there is an active session (user logged in or not)
router.get('/login', (req, res, next) => {
  User.findById(req.session.userId)
  .exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.render('login');
      } else {
        return res.render('account', { user: user });
      }
    }
  });
});

// GET Register route depending on whether there is an active session (user logged in or not)
router.get('/register', (req, res, next) => {
  User.findById(req.session.userId)
  .exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.render('register');
      } else {
        return res.render('account', { user: user });
      }
    }
  });
});

// GET My Account route depending on whether there is an active session (user logged in or not)
router.get('/account', (req, res, next) => {
  // User.findById(req.session.userId)
  // .exec((error, user) => {
  //   if (error) {
  //     return next(error);
  //   } else {
  //     if (user === null) {
  //       let err = new Error('Access Denied! Please Login First.');
  //       return res.render('login', { err: err });
  //     } else {
  //       Question
  //         .find({userId : req.session.userId})
  //         .then( (result) => {
  //           // add results to rendered page
  //           res.render('account', { user: user, result: result });
  //         })
  //         .catch( (err) => {
  //             console.log("error getting created questions from db")
  //             res.render('account', { user: user });
  //           });
  //     }
  //   }
  // });
  User.findById(req.session.userId)
  .exec((error, current) => {
    if (error) {
      return next(error);
    } else {
      if (current === null) {
        let err = new Error('Access Denied! Please Login First.');
        return res.render('login', { err: err });
      } else {
        Question.find({userId: req.session.userId})
        .exec((error, questions) => {
          if (error) {
            return next(error);
          } else {
            if (questions === null) {
              return res.render('account');
            } else {
              return res.render('account', { questions: questions, current: current});
            }
          }
        });
      }
    }
  });
  
});


// GET About route depending on whether there is an active session (user logged in or not)
router.get('/about', (req, res, next) => {
  User.findById(req.session.userId)
  .exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.render('about');
      } else {
        return res.render('about', { user: user });
      }
    }
  });
});

router.get('/question', (req, res, next) => {
  res.render('question', { username: req.session.username});
  // User.findById(req.session.userId)
  // .exec((error, user) => {
  //   if (error) {
  //     return next(error);
  //   } else {
  //     if (user === null) {
  //       return res.render('question');
  //     } else {
  //       return res.render('question', { user: user });
  //     }
  //   }
  // });
});

// GET New Game route depending on whether there is an active session (user logged in or not)
router.get('/newgame', (req, res, next) => {
  res.render('newgame', { username: req.session.username});
  // User.findById(req.session.userId)
  // .exec((error, user) => {
  //   if (error) {
  //     return next(error);
  //   } else {
  //     if (user === null) {
  //       return res.render('newgame');
  //     } else {
  //       return res.render('newgame', { user: user });
  //     }
  //   }
  // });
});

// POST New Game data depending on user input
router.post('/newgame', (req, res, next) => {
  let url_path = "https://opentdb.com/api.php?"
  url_path += "amount=" + req.body.num_questions;
  url_path += "&category=" + req.body.trivia_cat;
  url_path += "&difficulty=" + req.body.diff_level;
  url_path += "&type=" + req.body.trivia_type;
  
  request.get(url_path, (err, result, data) => {
    data = JSON.parse(data)

    Question
      .find({difficulty: req.body.diff_level, type: req.body.trivia_type, category: req.body.trivia_cat})
      .limit(parseInt(req.body.num_questions))
      .exec((err2, results2) => {
        if (err || err2) {
          res.render('newgame', {username: req.session.username, error: true})
        } else {
          data.results = data.results.concat(results2)

          if (data.response_code === 1 && data.results.length < parseInt(req.body.num_questions)) {
            res.render('newgame', {username: req.session.username, error: true})
          } else {
            data.results = data.results.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
            data.results = data.results.slice(0, parseInt(req.body.num_questions))
            correct = [];
            for (i in data.results) {
              correct.push(data.results[i].correct_answer);
              let choices = data.results[i].incorrect_answers;
              choices.push(data.results[i].correct_answer);
              choices.sort();
              data.results[i].choices = choices;
            }
          res.render('newgame', {questions: data.results, correct: correct, username: req.session.username})
          }
        }
      });
  })
});

function dataSorter(user1, user2){
  if (user1.score > user2.score) 
    return -1;
  else 
    return 1;
}

// GET Leader Board route depending on whether there is an active session (user logged in or not)
router.get('/leaderboard', (req, res, next) => {
  User.findById(req.session.userId)
  .exec((error, current) => {
    if (error) {
      return next(error);
    } else {
      if (current === null) {
        User.find({})
        .exec((error, user) => {
          if (error) {
            return next(error);
          } else {
            if (user === null) {
              return res.render('leaderboard');
            } else {
              return res.render('leaderboard', { user: user.sort(dataSorter)});
            }
          }
        });
      } else {
        User.find({})
        .exec((error, user) => {
          if (error) {
            return next(error);
          } else {
            if (user === null) {
              return res.render('leaderboard');
            } else {
              return res.render('leaderboard', { user: user.sort(dataSorter), current: current});
            }
          }
        });
      }
    }
  });
  
});

// router.get('/leaderboard', (req, res, next) => {
//   User.findById(req.session.userId)
//   .exec((error, user) => {
//     if (error) {
//       return next(error);
//     } else {
//       if (user === null) {
//         return res.render('leaderboard');
//       } else {
//         return res.render('leaderboard', { user: user });
//       }
//     }
//   });
// });

// GET route to logout and delete session
router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

//POST route to Register new user, error check, and redirect to login on success
router.post('/register', (req, res, next) => {
  if (req.body.password !== req.body.confirmedPassword) {
    let err = new Error('Passwords Do Not Match');
    return res.render('register', { err: err });
  }
  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.confirmedPassword) {
    let userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    }
    User.create(userData, (error, user) => {
      if (error) {
        let err = new Error('Email Already Exists');
        return res.render('register', { err: err });
      } else {
        let err = 'Success: Please Login With Your Email & Password';
        return res.render('login', { err: err });
      }
    });
  } else {
    let err = new Error('All Fields Are Required.');
    return res.render('register', { err: err });
  }
});

//POST route to login and create session
router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, (error, user) => {
      if (error || !user) {
        let err = new Error('Incorrect Email / Password');
        return res.render('login', { err: err });
      } else {
        req.session.userId = user._id;
        req.session.username = user.username;
        return res.render('index', { user: user });
      }
    });
  }
});


// DELETE route to delete an existing question
router.delete('/question', (req, res, next) => {
  let questionId = req.body.questionId;
  Question
    .remove({_id: questionId})
    .then( (result) => {
      let err = new Error('Question deleted successfully.');
      res.render('index', {user: {username: req.session.username}, err: err});
    })
    .catch( (error) => {
      let err = new Error('Concurrent deletion!');
      res.render('index', {user: {username: req.session.username}, err: err});
    });
});


//POST route to create a new question
router.post('/question', (req, res, next) => {
  let newQuestion = new Question({
      _id: new mongoose.Types.ObjectId(),
      userId: req.session.userId,
      difficulty: req.body.difficulty,
      type: req.body.type,
      category: req.body.category,
      question: req.body.question,
      correct_answer: req.body.correct_answer.filter((x) => x.length != 0),
      incorrect_answers: req.body.incorrect_answers.filter((x) => x.length != 0)
  });

  if (answersValidator(newQuestion)) {
  newQuestion
    .save()
    .then( (result) => {
      let err = 'Question Created Successfuly';
      res.render('question', {question: result, username: req.session.username, err: err});
    })
    .catch( (error) => {
      let err = new Error('Question Creation Failed');
      
      let question = newQuestion.toJSON()
      delete question._id;
      res.render('question', {question: question, username: req.session.username, err: err});
    })
  } else {
    let err = new Error('Question Fields Combination is Not Allowed');
    
    let question = newQuestion.toJSON()
    delete question._id;
    res.render('question', {question: question, username: req.session.username, err: err});
  }
});

//PUT route to update a question
router.put('/question', (req, res, next) => {
  let questionId = req.body.questionId;
  let fields = {
    difficulty: req.body.difficulty,
    type: req.body.type,
    category: req.body.category,
    question: req.body.question,
    correct_answer: req.body.correct_answer.filter((x) => x.length != 0),
    incorrect_answers: req.body.incorrect_answers.filter((x) => x.length != 0)
  };
  Object.keys(fields).forEach((key) => (fields[key] == null) && delete fields[key])
  // if (!(fields.incorrect_answers.constructor === Array)) {
  //   fields.incorrect_answers = [fields.incorrect_answers]
  // }

  if ((fields.type && fields.correct_answer && fields.incorrect_answers && answersValidator(fields)) || (!fields.type && !fields.correct_answer && !fields.incorrect_answers)) {
  Question
  .update({_id: questionId, userId: req.session.userId}, {$set: fields}, {runValidators: true})
    .then( (result) => {
      if (result && result.nModified > 0) {
        let err = 'Question Updated Successfuly';
        fields._id = questionId;
        res.render('question', {question: fields, username: req.session.username, err: err});
      } else {
        let err = new Error('No Valid Fields To Update');
        fields._id = questionId;
        res.render('question', {question: fields, username: req.session.username, err: err});
      }
    })
    .catch( (error) => {
      let err = new Error('Question Update Failed');
      fields._id = questionId;
      res.render('question', {question: fields, username: req.session.username, err: err});
    });
  } else {
    let err = new Error('Question Update Fields Combination is Not Allowed');
    fields._id = questionId;
    res.render('question', {question: fields, username: req.session.username, err: err});
}
});

// function that validate the number of incorrect answers
function answersValidator(fields) {
  if (fields.type == 'multiple' && fields.incorrect_answers.length == 3) {
      return true;
  } else if (fields.type == 'boolean' && fields.incorrect_answers.length == 1 && correctAnswerValidator(fields.incorrect_answers[0]) && (fields.incorrect_answers[0] != fields.correct_answer) && correctAnswerValidator(fields.correct_answer)) {
      return true;
  }
  return false;
}

// function that validate the correct answer
function correctAnswerValidator(value) {
  if ((value == 'False' || value == 'True')) {
      return true;
  }
  return false;
}

//PUT route to update a question
router.put('/question', (req, res, next) => {
  let questionId = req.body.questionId;
  let fields = {
    difficulty: req.body.difficulty,
    type: req.body.type,
    category: req.body.category,
    question: req.body.question,
    correct_answer: req.body.correct_answer.filter((x) => x.length != 0),
    incorrect_answers: req.body.incorrect_answers.filter((x) => x.length != 0)
  };
  Object.keys(fields).forEach((key) => (fields[key] == null) && delete fields[key])
  // if (!(fields.incorrect_answers.constructor === Array)) {
  //   fields.incorrect_answers = [fields.incorrect_answers]
  // }

  if ((fields.type && fields.correct_answer && fields.incorrect_answers && answersValidator(fields)) || (!fields.type && !fields.correct_answer && !fields.incorrect_answers)) {
  Question
  .update({_id: questionId, userId: req.session.userId}, {$set: fields}, {runValidators: true})
    .then( (result) => {
      if (result && result.nModified > 0) {
        let err = 'Question Updated Successfuly';
        fields._id = questionId;
        res.render('question', {question: fields, username: req.session.username, err: err});
      } else {
        let err = new Error('No Valid Fields To Update');
        fields._id = questionId;
        res.render('question', {question: fields, username: req.session.username, err: err});
      }
    })
    .catch( (error) => {
      let err = new Error('Question Update Failed');
      fields._id = questionId;
      res.render('question', {question: fields, username: req.session.username, err: err});
    });
  } else {
    let err = new Error('Question Update Fields Combination is Not Allowed');
    fields._id = questionId;
    res.render('question', {question: fields, username: req.session.username, err: err});
}
});

//PUT route to update a question
router.post('/updateScore', (req, res, next) => {
  let fields = {
    score: req.body.num_correct,
  };
  Object.keys(fields).forEach((key) => (fields[key] == null) && delete fields[key])

  if (req.session.userId) {
    User
      .update({_id: req.session.userId}, {$set: fields}, {runValidators: true})
      .then( (result) => {
        let err = 'User Score Updated Successfuly'
        console.log(err);
      })
      .catch( (error) => {
        let err = new Error('Can Not Update User Score')
        console.log(err);
      });
  }
});

module.exports = router;
