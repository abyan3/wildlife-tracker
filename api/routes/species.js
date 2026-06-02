var express = require('express');
var router = express.Router();
const {supabase} = require('../supabaseService.js')
const NodeCache = require('node-cache');
const speciesCache = new NodeCache();


router.get('/', async function(req, res, next) {
  // client caching 1 day
  res.set('Cache-Control', 'public, max-age=86400')
  let species = speciesCache.get('species')

  if(!species) {
    const { data, error } = await supabase
      .from('species')
      .select()

    if(error){
      res.status(500).send({message: error.message});
      return;
    }
    speciesCache.set('species', data, 86400)
    species = data
  }

  res.status(200).send({data: species});
});

router.get('/:id', async (req, res, next) => {
  // client caching 1 day
  res.set('Cache-Control', 'public, max-age=86400')
  const cacheKey = `species_${req.params.id}`
  let species = speciesCache.get(cacheKey)

  if (!species) {
    const { data, error } = await supabase
      .from('species')
      .select()
      .eq('id', req.params.id)
      .single();

    if(error){
      res.status(404).send({message: "No species with that id"});
      return;
    }
    speciesCache.set(cacheKey, data, 86400)
    species = data
  }
  res.status(200).send({ data: species })
})

// router.get('/:id', function(req, res, next) {
//   console.log('get /species/:id');
//   res.status(200).send({data: res.locals.theSpecies});
//   next();
// });

module.exports = router;
