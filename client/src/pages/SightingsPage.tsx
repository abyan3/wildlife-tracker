import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Sighting = {
  id: number
  date_time: string
  park_id: string
  species_id: string
  user_id?: string
  notes?: string | null
  lat?: number | null
  long?: number | null
  image_path?: string | null
}

export function SightingsPage() {
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [parkId, setParkId] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [notes, setNotes] = useState('')
  const [lat, setLat] = useState('')
  const [long, setLong] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function loadSightings() {
    if (!supabase) return
    const { data, error } = await supabase.from('sightings').select('*')
    if (!error) setSightings(data ?? [])
  }

  useEffect(() => {
    void loadSightings()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!supabase) {
      setNotice('Add your Supabase URL and anon key to .env.local.')
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setNotice('Please sign in before submitting a sighting.')
      return
    }

    let imagePath: string | null = null

    if (imageFile) {
      imagePath = `${crypto.randomUUID()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('sightingImages')
        .upload(imagePath, imageFile)

      if (uploadError) {
        setNotice(uploadError.message)
        return
      }
    }

    const { error } = await supabase.from('sightings').insert({
      park_id: parkId,
      species_id: speciesId,
      user_id: userData.user.id,
      date_time: dateTime,
      notes: notes || null,
      lat: lat ? Number(lat) : null,
      long: long ? Number(long) : null,
      image_path: imagePath,
    })

    if (error) {
      console.log('Full error:', JSON.stringify(error, null, 2))
      setNotice(error.message)
      return
    }

    await loadSightings()
    setNotice('Sighting submitted.')
    setParkId('')
    setSpeciesId('')
    setDateTime('')
    setNotes('')
    setLat('')
    setLong('')
    setImageFile(null)
  }

  return (
    <div>
      <h1>Sightings</h1>
      <h2>New sighting</h2>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <label htmlFor="s-park">
            Park id{' '}
            <input
              id="s-park"
              value={parkId}
              onChange={(e) => setParkId(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-species">
            Species id{' '}
            <input
              id="s-species"
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-when">
            Date / time{' '}
            <input
              id="s-when"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-notes">
            Notes{' '}
            <input
              id="s-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-lat">
            Lat{' '}
            <input
              id="s-lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-long">
            Long{' '}
            <input
              id="s-long"
              value={long}
              onChange={(e) => setLong(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="s-image">
            Image{' '}
            <input
              id="s-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
      {notice && <p role="status">{notice}</p>}
      <h2>All sightings</h2>
      <ul>
        {sightings.map((s) => (
          <li key={s.id}>
            <p>Park: {s.park_id}</p>
            <p>Species: {s.species_id}</p>
            <p>Date/time: {s.date_time}</p>
            <p>User: {s.user_id}</p>
            <p>Notes: {s.notes}</p>
            <p>Lat: {s.lat}</p>
            <p>Long: {s.long}</p>
            <p>Image: {s.image_path}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}