var express = require('express');
var router = express.Router();
const {supabase} = require('../supabaseService.js');

router.post('/signout', async function(req, res, next) {
  // Remember that server-side works a little differently than client side
  // https://supabase.com/docs/reference/javascript/auth-signout
  const { data, error } = await supabase.auth.signOut();
  if(error){
    res.status(400).send({message: error.message});
    return;
  }

  res.status(200).send({});
  next();
});

router.post('/signin', async function(req, res, next) {
  // https://supabase.com/docs/reference/javascript/auth-signinwithpassword
  const { data, error } = await supabase.auth.signInWithPassword({
    email: req.query.email,
    password: req.query.password,
  });

  if(error){
    res.status(401).send({message: error.message});
    return;
  }

  res.status(200).send({
    data: {
      session: {
        token: data.session.access_token,
        expires_at: data.session.expires_at
      }
    }
  });
  next();
});

router.post('/signup', async function(req, res, next) {
  // https://supabase.com/docs/reference/javascript/auth-signup
 const { data, error } = await supabase.auth.signUp({
    email: req.query.email,
    password: req.query.password,
  });

  if(error){
    res.status(400).send({message: error.message});
    return;
  }

  res.status(201).send({data: data.user});
  next();
});

module.exports = router;