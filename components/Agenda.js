import React, { useRef }from "react"
import { Form, Button, Card} from "react-bootstrap"
import { db } from "../firebase"
export default function Agenda() {
  const textRef = useRef()

  function handleSubmit(e) {
    e.preventDefault()
    db.collection('todos').add({
        date: new Date(),
        todo: textRef.current.value,
    }
    )
  }

  return (
    <>
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Control type="text" ref={textRef} required />
            </Form.Group>
            <Button className="w-100" type="submit">
              Add text
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}