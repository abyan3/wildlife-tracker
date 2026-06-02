var express = require('express');
var router = express.Router();
const {supabase} = require('../supabaseService.js')
const NodeCache = require('node-cache');
const sightingsCache = new NodeCache();

router.get('/', async function(req, res, next) {
  //client cache 10 mins
  res.set('Cache-Control', 'public, max-age=600')
  const { park, since, before } = req.query
  const cacheKey = `sightings_${park || 'all'}_${since || ''}_${before || ''}`
  let sightings = sightingsCache.get(cacheKey)
  if (!sightings) {
    let sight = supabase.from('sightings').select()
    if (park) sight = sight.eq('park_id', park)
    if (since) sight = sight.gte('date_time', `${since}T00:00:00`)
    if (before) sight = sight.lte('date_time', `${before}T23:59:59`)
    const { data, error } = await sight
    if (error) {
      res.status(500).send({ message: error.message })
      return
    }
    sightingsCache.set(cacheKey, data, 600)
    sightings = data
  }

  res.status(200).send({ data: sightings})
});

router.get('/:user_id', async function(req, res, next) {
  //client cache 10 mins
  res.set('Cache-Control', 'public, max-age=600')
  const cacheKey = `sightings_user_${req.params.user_id}`
  let sightings = sightingsCache.get(cacheKey)

  if (!sightings) {
  const { data, error } = await supabase
      .from('sightings')
      .select()
      .eq('user_id', req.params.user_id)

    if(error){
      res.status(404).send({message: "No sightings for that user"});
      return;
    }
    sightingsCache.set(cacheKey, data, 600)
    sightings = data
  }

  res.status(200).send({ data: sightings })
});

// router.get('/:user_id', function(req, res, next) {
//   console.log('get /sightings/:user_id');
//   res.status(200).send({data: res.locals.theSightings});
//   next();
// });

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

  sightingsCache.flushAll()

  res.status(201).send({data: data});
});

module.exports = router;
