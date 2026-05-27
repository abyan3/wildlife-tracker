var express = require('express');
var router = express.Router();
const {supabase} = require('../supabaseService.js')

router.get('/', async function(req, res, next) {
  const { data, error } = await supabase
    .from('sightings')
    .select()

    if(error){
    res.status(500).send({message: error.message});
    return;
  }

  res.status(200).send({data: data});
});

router.get('/:user_id', async function(req, res, next) {
  const { data, error } = await supabase
    .from('sightings')
    .select()
    .eq('user_id', req.params.user_id)

  if(error){
    res.status(404).send({message: "No sightings for that user"});
    return;
  }

  res.locals.theSightings = data;
  next();
});

router.get('/:user_id', function(req, res, next) {
  console.log('get /sightings/:user_id');
  res.status(200).send({data: res.locals.theSightings});
  next();
});

router.post('/', async function(req, res, next) {
  // Get the authenticated user by their session token (jwt)
  // https://supabase.com/docs/reference/javascript/auth-updateuser
  const { data: userData, error: userError } = await supabase.auth.getUser(req.query.accessToken);

  if(userError || !userData.user){
    res.status(401).send({message: "Invalid"});
    return;
  }

  const { data, error } = await supabase
    .from('sightings')
    .insert({
      park_id: req.query.parkID,
      species_id: req.query.speciesID,
      user_id: userData.user.id,
      date_time: new Date().toISOString()
    })
    .select()
    .single()

  if(error){
    res.status(500).send({message: error.message});
    return;
  }

  res.status(201).send({data: data});
});

module.exports = router;
