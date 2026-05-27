import { type SubmitEvent, useEffect, useState } from 'react'
import { type Park } from '../data/placeholders'

export function ParksPage() {
  const [idInput, setIdInput] = useState('')
  const [selected, setSelected] = useState<Park | null>(null)
  const [lookedUp, setLookedUp] = useState(false)
  const [parks, setParks] = useState<Park[]>([])

  useEffect(() => {
    fetch('https://assignment-4-database-and-authentic-eight.vercel.app/parks')
      .then((res) => res.json())
      .then((data) => setParks(data.data))
  }, [])


  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const trimmed = idInput.trim()
    console.log({ id: trimmed })
    setLookedUp(true)
    const match = parks.find(
      (p) => p.ID.toLowerCase() === trimmed.toLowerCase(),
    )
    setSelected(match ?? null)
    setIdInput('')
  }

  return (
    <div>
      <h1>Parks</h1>
      <h2>Look up by id</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="park-id">
          Id{' '}
          <input
            id="park-id"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
        </label>{' '}
        <button type="submit">Submit</button>
      </form>
      {selected && (
        <p>
          Selected: {selected.Name} ({selected.State}) — id {selected.ID}
        </p>
      )}
      {lookedUp && !selected && (
        <p>No park found for that id (check console for submitted value).</p>
      )}
      <h2>All parks</h2>
      <ul>
        {parks.map((p) => (
          <li key={p.ID}>
            {p.Name}, {p.State}
          </li>
        ))}
      </ul>
    </div>
  )
}