var express = require('express');
var router = express.Router();
const {supabase} = require('../supabaseService.js')
const NodeCache = require('node-cache');
const parksCache = new NodeCache();

router.get('/', async function(req, res, next) {
  // client cache for hour
  res.set('Cache-Control', 'public, max-age=3600');

  // check cache
  let parks = parksCache.get('parks');
  if(!parks) {
    const { data, error } = await supabase
    .from('parks')
    .select()

    if(error){
      res.status(500).send()
      return;
    }
    parksCache.set('parks', data, 3000)
    parks = data;
  }

  res.status(200).send({data: parks})
});

router.get('/:id', async (req, res, next) => {
  // client cache
  res.set('Cache-Control', 'public, max-age=3600');
  const cacheKey = `park_${req.params.id}`;
  let park = parksCache.get(cacheKey)

  if (!park) {
  const { data, error } = await supabase
    .from('parks')
    .select()
    .eq('id', req.params.id)
    .single();

    if(error){
      res.status(404).send({message: "There is no park with that id"});
      return;
    }
    parksCache.set(cacheKey, data, 3600)
    park = data
  }

  // res.locals.thePark = data;
  // next();
  res.status(200).send({data: park});
})

// router.get('/:id', function(req, res, next) {
//   res.status(200).send({data: res.locals.thePark});
//   next();
// });

module.exports = router;
