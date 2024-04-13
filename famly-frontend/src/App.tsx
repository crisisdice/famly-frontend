import { useEffect, useState } from 'react'
import DATA from '../../kids.json'
import './App.css'


function App() {
  const { children: foo } = DATA 

  type Children = typeof foo

  const [children, setChildren] = useState<Children>([])

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

 
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:5000/kids.json");
      const newData = await response.json();
      console.log("foo")
      await delay(2000)
      console.log("bar")
      setChildren(newData.children);
    };

    fetchData();
  }, [children])
    
  if (children.length === 0) {
    return <>
      "Loading..."
    </>
  }

  return (
    <ul>
      {children.map(({ name: { firstName } }) => <li>{firstName}</li>)}
    </ul>
  )
}

export default App
