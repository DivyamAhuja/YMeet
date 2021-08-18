import { useEffect } from 'react'

const CreateRoom = (props) => {
    function create() {
        fetch('/createRoom', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then( res => res.json())
        .then( data => {
            props.history.push(`/room/${data.roomID}`)
        })
    }

    useEffect(() => {
        create()
    })

    return null;
}

export default CreateRoom;