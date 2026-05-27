import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

export function ParkPage() {
  const { id } = useParams()
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('after')
  const [sightings, setSightings] = useState<Sighting[]>([])

  useEffect(() => {
    console.log('id is:', id)
    if (!id || !supabase) return

    let query = supabase
      .from('sightings')
      .select('*')
      .ilike('park_id', id)

    if (filterDate) {
      if (filterType === 'before') {
        query = query.lt('date_time', filterDate)
      } else {
        query = query.gt('date_time', filterDate)
      }
    }

    query.then(({ data, error }) => {
      console.log('data:', data, 'error:', error)
      if (!error) setSightings(data ?? [])
    })
  }, [id, filterDate, filterType])

  return (
    <div>
      <h1>Park {id}</h1>
      <h2>Sightings</h2>

      <label htmlFor="filter-type">
        Show sightings{' '}
        <select
          id="filter-type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="after">after</option>
          <option value="before">before</option>
        </select>
      </label>{' '}

      <label htmlFor="filter-date">
        date{' '}
        <input
          id="filter-date"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </label>

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

      {sightings.length === 0 && <p>No sightings found.</p>}
    </div>
  )
}