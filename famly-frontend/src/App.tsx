import {useEffect, useRef, useState} from 'react'
import DATA from '../kids.json'
import './App.css'

const URLV1 = 'https://app.famly.co/api'
const URLV2 = 'https://app.famly.co/api/v2/children'

type Children = typeof DATA.children

function App() {

  const [children, setChildren] = useState<Children>([])
  const [childrenToRender, setChildrenToRender] = useState<Children>([])
  const [activeChild, setActiveChild] = useState<Children[0] | null>(null)
  const [pickupTime, setPickupTime] = useState<string>("12:00")

  // TODO in a real app this would make sense as a cookie
  const accessToken = "1127a03c-ed76-41d5-9058-f9ca105c41cf"

  const ref = useRef<HTMLDialogElement>(null);

  const onScroll = () => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
      setChildrenToRender([...childrenToRender, ...children.slice(childrenToRender.length, childrenToRender.length + 5)])
    }
  }

  window.addEventListener('scroll', onScroll);

  const toggleDialog = (id: string) => {
    const child = children.find(({childId}) => childId === id) ?? null
    setActiveChild(child)

    if (child !== null) {
      ref.current?.showModal()
    }
  }

  const onCheckIn = async ({childId}: Children[0]) => {
    try {
      setChildren([])

      const body = new URLSearchParams();

      body.append("accessToken", accessToken)
      body.append("pickupTime", pickupTime)

      await fetch(`${URLV2}/${childId}/checkins`, {
        method: "POST",
        body: body
      })

      await fetchChildren()

    } catch (err) {
      alert(`Error checking in child`)
    }
  }

  const onCheckOut = async ({childId}: Children[0]) => {
    try {
      setChildren([])

      const body = new URLSearchParams();

      body.append("accessToken", accessToken)

      await fetch(`${URLV2}/${childId}/checkout`, {
        method: "POST",
        body,
      })

      await fetchChildren()

    } catch (err) {
      alert(`Error checking out child`)
    }
  }


  const fetchChildren = async () => {
    const url = new URL(`${URLV1}/daycare/tablet/group`)

    url.searchParams.append("accessToken", accessToken)
    url.searchParams.append("groupId", "86413ecf-01a1-44da-ba73-1aeda212a196")
    url.searchParams.append("institutionId", "dc4bd858-9e9c-4df7-9386-0d91e42280eb")

    const response = await fetch(url.toString())
    const newData = await response.json();
    setChildren(newData.children);
  };

  useEffect(() => {
    fetchChildren();
  }, [])

  useEffect(() => {
    setChildrenToRender(children.slice(0, 12))
  }, [children])

  if (children.length === 0) {
    return <>
      "Loading..."
    </>
  }

  return (
    <>
      <table onScroll={onScroll}>
        <thead>
          <tr>
            <th>Picture</th>
            <th>First name</th>
            <th>Last name</th>
            <th>Toggle Check In</th>
          </tr>
        </thead>
        <tbody>
          {childrenToRender.map(({childId, name: {firstName, lastName}, image: {small}, checkedIn}) => (
            <tr key={childId}>
              <td><img src={small} style={{width: "40px"}}></img></td>
              <td>{firstName}</td>
              <td>{lastName}</td>
              <td><button onClick={() => toggleDialog(childId)}>{checkedIn ? "Check out" : "Check in "}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {activeChild !== null &&
        <dialog ref={ref}>
          <p>{activeChild?.checkedIn ? `Check out ${activeChild.name.firstName}?` : `Check in ${activeChild?.name.firstName}`}</p>
          <form method="dialog">
            {!activeChild?.checkedIn &&
              <>
                <label htmlFor="pickupTime">Pickup time: </label>
                <input id="pickupTime" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}></input>
              </>
            }
            <button onClick={() => activeChild?.checkedIn ? onCheckOut(activeChild) : onCheckIn(activeChild)}>Ok</button>
            <button formNoValidate>Cancel</button>
          </form>
        </dialog>
      }
    </>
  )
}

export default App
