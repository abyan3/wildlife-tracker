var express = require('express');
var router = express.Router();
const {supabase} = require('../supabaseService.js')

router.get('/', async function(req, res, next) {
  const { data, error } = await supabase
    .from('species')
    .select()

  if(error){
    res.status(500).send({message: error.message});
    return;
  }

  res.status(200).send({data: data});
});

router.get('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('species')
    .select()
    .eq('id', req.params.id)
    .single();

  if(error){
    res.status(404).send({message: "No species with that id"});
    return;
  }

  res.locals.theSpecies = data;
  next();
})

router.get('/:id', function(req, res, next) {
  console.log('get /species/:id');
  res.status(200).send({data: res.locals.theSpecies});
  next();
});

module.exports = router;
