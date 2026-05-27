var express = require('express');
var router = express.Router();
const {supabase} = require('../supabaseService.js')

router.get('/', async function(req, res, next) {
  const { data, error } = await supabase
  .from('parks')
  .select()

  console.log('data:', data);
  console.log('error:', error);

  if(error){
    res.status(500).send()
    return;
  }

  res.status(200).send({data: data})
  // next()
});

router.get('/:id', async (req, res, next) => {
  const { data, error } = await supabase
  .from('parks')
  .select()
  .eq('id', req.params.id)
  .single();

  if(error){
    res.status(404).send({message: "There is no park with that id"});
    return;
  }
  res.locals.thePark = data;
  next();
})

router.get('/:id', function(req, res, next) {
  res.status(200).send({data: res.locals.thePark});
  next();
});

module.exports = router;
